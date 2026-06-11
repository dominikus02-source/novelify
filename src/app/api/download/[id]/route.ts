import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    if (!userId) return new Response(null, { status: 401 });

    const { id } = await params;
    const exportJob = await db.exportJob.findUnique({ where: { id }, select: { status: true, filePath: true, format: true, fileName: true, fileSize: true, project: { select: { userId: true } } } });

    if (!exportJob) return NextResponse.json({ error: 'Export not found' }, { status: 404 });
    if (exportJob.project.userId !== userId) return new Response(null, { status: 403 });
    if (exportJob.status !== 'completed' || !exportJob.filePath) {
      return NextResponse.json({ error: 'Export not ready' }, { status: 400 });
    }

    const fs = await import('fs/promises');
    const buffer = await fs.readFile(exportJob.filePath);

    const mimeTypes: Record<string, string> = {
      epub: 'application/epub+zip',
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      markdown: 'text/markdown',
    };

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeTypes[exportJob.format] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${exportJob.fileName || 'export'}"`,
        'Content-Length': String(exportJob.fileSize),
      },
    });
  } catch (error) {
    console.error('Error downloading export:', error);
    return NextResponse.json({ error: 'Failed to download export' }, { status: 500 });
  }
}
