import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { assertAdminAccess } from '@/lib/admin/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await assertAdminAccess();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        plan: true,
        subscriptionStatus: true,
        wordCountUsed: true,
        dailyWordCount: true,
        createdAt: true,
        updatedAt: true,
        projects: {
          select: {
            id: true,
            title: true,
            genre: true,
            status: true,
            createdAt: true,
            chapters: {
              select: { wordCount: true },
            },
            _count: {
              select: { chapters: true, exportJobs: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            provider: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            trialEndsAt: true,
            createdAt: true,
          },
        },
        usageTracking: {
          orderBy: { periodStart: 'desc' },
          take: 6,
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            aiCreditsUsed: true,
            starterOutlinesUsed: true,
            revisionChecksUsed: true,
            fullRevisionChecksUsed: true,
            translationWordsUsed: true,
            exportsUsed: true,
            marketingAssetsUsed: true,
            projectsCreated: true,
          },
        },
        feedbackSubmitted: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            category: true,
            message: true,
            status: true,
            priority: true,
            createdAt: true,
          },
        },
        exportJobs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            format: true,
            status: true,
            fileName: true,
            errorMessage: true,
            createdAt: true,
            completedAt: true,
            project: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [billingEvents, usageEvents] = await Promise.all([
      db.billingEvent.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          provider: true,
          type: true,
          status: true,
          plan: true,
          amount: true,
          currency: true,
          createdAt: true,
        },
      }),
      db.usageEvent.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const projectsWithWordCount = user.projects.map((project) => {
      const totalWordCount = project.chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
      const { chapters, ...rest } = project;
      return { ...rest, totalWordCount };
    });

    const usageEventsWithProject = await Promise.all(
      usageEvents.map(async (e) => {
        let project: { id: string; title: string } | null = null;
        if (e.projectId) {
          project = await db.project.findUnique({
            where: { id: e.projectId },
            select: { id: true, title: true },
          });
        }
        return {
          id: e.id,
          type: e.type,
          amount: e.amount,
          metadataJson: e.metadataJson,
          createdAt: e.createdAt,
          project,
        };
      })
    );

    return NextResponse.json({
      ...user,
      projects: projectsWithWordCount,
      billingEvents,
      usageEvents: usageEventsWithProject,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
