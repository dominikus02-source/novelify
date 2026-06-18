import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getUserId, unauthorized } from '@/lib/session';

// GET /api/dashboard/summary - Lightweight dashboard metrics
export async function GET() {
  try {
    const userId = await getUserId();

    // Fetch minimal project list (no chapter/scene content)
    const projects = await db.project.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        genre: true,
        status: true,
        coverImage: true,
        wordTarget: true,
        updatedAt: true,
        chapters: {
          select: {
            wordCount: true,
            status: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: { chapters: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Compute aggregate metrics
    const totalProjects = projects.length;
    let totalWords = 0;
    let totalChapters = 0;
    let lastSavedAt: string | null = null;
    let activeProject: (typeof projects)[number] | null = null;

    for (const project of projects) {
      const chapterCount = project._count.chapters;
      totalChapters += chapterCount;

      for (const chapter of project.chapters) {
        totalWords += chapter.wordCount;
      }

      // Track latest update across all projects
      if (project.updatedAt && (!lastSavedAt || project.updatedAt > new Date(lastSavedAt))) {
        lastSavedAt = project.updatedAt.toISOString();
      }

      // First project with draft/translating status is the "active" one
      if (!activeProject && (project.status === 'draft' || project.status === 'translating')) {
        activeProject = project;
      }
    }

    // Fallback: if no active project found, use the most recently updated
    if (!activeProject && projects.length > 0) {
      activeProject = projects[0];
    }

    // Get today's word count from user record
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        dailyWordCount: true,
        dailyWordDate: true,
      },
    });

    const today = new Date().toISOString().slice(0, 10);
    const wordsToday =
      user?.dailyWordDate === today ? (user?.dailyWordCount ?? 0) : 0;

    // Build recent projects list (wordCount and chapterCount computed)
    const recentProjects = projects.slice(0, 10).map((p) => ({
      id: p.id,
      title: p.title,
      genre: p.genre,
      status: p.status,
      wordCount: p.chapters.reduce((sum, ch) => sum + ch.wordCount, 0),
      chapterCount: p._count.chapters,
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      activeProject: activeProject
        ? {
            id: activeProject.id,
            title: activeProject.title,
            genre: activeProject.genre,
            status: activeProject.status,
            updatedAt: activeProject.updatedAt.toISOString(),
          }
        : null,
      recentProjects,
      totalProjects,
      totalWords,
      totalChapters,
      wordsToday,
      lastSavedAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorized();
    }
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}
