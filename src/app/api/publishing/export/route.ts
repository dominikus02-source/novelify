import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { getOrderedManuscript } from '@/lib/manuscript';
import { generateEpubFromAssembly } from '@/lib/epub';
import { generatePdfFromAssembly } from '@/lib/pdf';
import { generateDocxFromAssembly } from '@/lib/docx';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const FORMAT_EXT: Record<string, string> = {
  epub: 'epub',
  pdf: 'pdf',
  docx: 'docx',
  markdown: 'md',
};

export async function POST(request: NextRequest) {
  let exportJob: { id: string } | null = null;

  try {
    const userId = await getUserId();

    const body = await request.json();
    const { projectId, format, options } = body;

    if (!projectId || !format) {
      return NextResponse.json({ error: 'projectId and format are required' }, { status: 400 });
    }

    if (!['epub', 'pdf', 'docx', 'markdown'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project || project.userId !== userId) {
      return new Response(null, { status: 403 });
    }

    exportJob = await db.exportJob.create({
      data: {
        projectId,
        userId,
        format,
        status: 'generating',
        optionsJson: JSON.stringify(options || {}),
      },
    });

    const manuscript = await getOrderedManuscript(projectId);

    let buffer: Buffer;
    switch (format) {
      case 'epub':
        buffer = await generateEpubFromAssembly(manuscript);
        break;
      case 'pdf':
        buffer = await generatePdfFromAssembly(manuscript);
        break;
      case 'docx':
        buffer = await generateDocxFromAssembly(manuscript);
        break;
      case 'markdown': {
        const md = buildMarkdown(manuscript, options);
        buffer = Buffer.from(md, 'utf-8');
        break;
      }
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    const ext = FORMAT_EXT[format] || format;
    const fileName = `${projectId}-${format}-${Date.now()}.${ext}`;
    const fileDir = '/tmp/exports';
    await mkdir(fileDir, { recursive: true });
    const filePath = path.join(fileDir, fileName);
    await writeFile(filePath, buffer);

    const completed = await db.exportJob.update({
      where: { id: exportJob.id },
      data: {
        status: 'completed',
        fileUrl: `/api/download/${exportJob.id}`,
        filePath,
        fileName,
        fileSize: buffer.length,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(completed);
  } catch (error) {
    console.error('Error exporting project:', error);

    if (exportJob?.id) {
      await db.exportJob.update({
        where: { id: exportJob.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Export failed',
        },
      });
    }

    return NextResponse.json({ error: 'Failed to export project' }, { status: 500 });
  }
}

function buildMarkdown(
  manuscript: import('@/lib/manuscript').ManuscriptAssembly,
  options?: { includeScenes?: boolean },
): string {
  const lines: string[] = [];

  lines.push(`# ${manuscript.title}`);
  lines.push('');
  lines.push(`by ${manuscript.author}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const chapter of manuscript.chapters) {
    lines.push(`## Chapter ${chapter.chapterNumber}: ${chapter.title}`);
    lines.push('');

    const paragraphs = chapter.content.split(/\n\s*\n/).filter(p => p.trim());
    for (const para of paragraphs) {
      if (para.startsWith('#')) {
        lines.push(`\\${para}`);
      } else {
        lines.push(para);
      }
      lines.push('');
    }

    if (options?.includeScenes && chapter.scenes && chapter.scenes.length > 0) {
      for (const scene of chapter.scenes) {
        if (scene.content) {
          lines.push(`### ${scene.title}`);
          lines.push('');
          const sceneParas = scene.content.split(/\n\s*\n/).filter(p => p.trim());
          for (const sp of sceneParas) {
            lines.push(sp);
            lines.push('');
          }
        }
      }
    }
  }

  return lines.join('\n');
}
