import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getOrderedManuscript } from '@/lib/manuscript';
import { generateEpubFromAssembly } from '@/lib/epub';
import { generatePdfFromAssembly } from '@/lib/pdf';
import { generateDocxFromAssembly } from '@/lib/docx';
import { getUserId } from '@/lib/session';
import { requireFeature, requireUsageLimit } from '@/lib/billing/feature-gates';
import { trackUsage } from '@/lib/billing/usage';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return new Response(null, { status: 401 });

    const body = await request.json();
    const { projectId, format, options } = body as {
      projectId: string;
      format: 'epub' | 'pdf' | 'docx' | 'markdown';
      options?: { includeScenes?: boolean; authorName?: string; language?: string };
    };

    if (!projectId || !format) {
      return NextResponse.json({ error: 'projectId and format are required' }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { userId: true, title: true },
    });

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (project.userId !== userId) return new Response(null, { status: 403 });

    const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const userPlan = user?.plan || 'free';

    if (format === 'pdf') {
      await requireFeature(userId, userPlan, 'export_pdf');
    } else if (format === 'docx') {
      await requireFeature(userId, userPlan, 'export_docx');
    }

    await requireUsageLimit(userId, userPlan, 'export', 1, 'exports');

    const exportJob = await db.exportJob.create({
      data: { projectId, userId, format, status: 'generating', optionsJson: JSON.stringify(options || {}) },
    });

    const assembly = await getOrderedManuscript(projectId);
    const includeScenes = options?.includeScenes ?? false;
    let buffer: Buffer;
    let mimeType: string;
    let ext: string;

    switch (format) {
      case 'epub': {
        buffer = await generateEpubFromAssembly(assembly, { includeScenes });
        mimeType = 'application/epub+zip';
        ext = 'epub';
        break;
      }
      case 'pdf': {
        buffer = await generatePdfFromAssembly(assembly, { includeScenes });
        mimeType = 'application/pdf';
        ext = 'pdf';
        break;
      }
      case 'docx': {
        buffer = await generateDocxFromAssembly(assembly, { includeScenes });
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        ext = 'docx';
        break;
      }
      case 'markdown': {
        const md = `# ${assembly.title}\n\n${assembly.chapters.map(ch =>
          `## Chapter ${ch.chapterNumber}: ${ch.title}\n\n${ch.content}\n`
        ).join('\n')}`;
        buffer = Buffer.from(md, 'utf-8');
        mimeType = 'text/markdown';
        ext = 'md';
        break;
      }
      default:
        return NextResponse.json({ error: `Unsupported format: ${format}` }, { status: 400 });
    }

    const safeName = project.title.replace(/[^a-zA-Z0-9-]/g, '_');
    const fileName = `${safeName}-${Date.now()}.${ext}`;
    const filePath = `/tmp/${fileName}`;
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, buffer);

    await db.exportJob.update({
      where: { id: exportJob.id },
      data: { status: 'completed', fileName, filePath, fileUrl: `/api/download/${exportJob.id}`, fileSize: buffer.length, completedAt: new Date() },
    });

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json({ error: 'Failed to export project' }, { status: 500 });
  }
}


