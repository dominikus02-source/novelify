import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId query parameter is required' }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project || project.userId !== userId) {
      return new Response(null, { status: 403 });
    }

    const chapters = await db.chapter.findMany({
      where: { projectId },
      select: {
        wordCount: true,
        _count: { select: { scenes: true } },
      },
    });

    const [checklist, lastExport, exportCount] = await Promise.all([
      db.publishingChecklist.findUnique({
        where: { projectId },
      }),
      db.exportJob.findFirst({
        where: { projectId, status: 'completed' },
        orderBy: { completedAt: 'desc' },
        select: { format: true, completedAt: true },
      }),
      db.exportJob.count({
        where: { projectId },
      }),
    ]);

    const wordCount = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
    const chapterCount = chapters.length;
    const sceneCount = chapters.reduce((sum, ch) => sum + ch._count.scenes, 0);

    return NextResponse.json({
      wordCount,
      chapterCount,
      sceneCount,
      metadataComplete: checklist?.metadataComplete ?? false,
      manuscriptReady: checklist?.manuscriptReady ?? false,
      revisionReady: checklist?.revisionReady ?? false,
      coverReady: checklist?.coverReady ?? false,
      synopsisReady: checklist?.synopsisReady ?? false,
      readinessScore: checklist?.readinessScore ?? 0,
      lastExportedFormat: lastExport?.format ?? null,
      lastExportedAt: lastExport?.completedAt?.toISOString() ?? null,
      exportCount,
    });
  } catch (error) {
    console.error('Error fetching publishing overview:', error);
    return NextResponse.json({ error: 'Failed to fetch publishing overview' }, { status: 500 });
  }
}
