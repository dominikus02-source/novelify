import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateChecklistSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

const CHECKLIST_FIELDS = [
  'metadataComplete', 'coverReady', 'synopsisReady', 'blurbReady',
  'frontMatterReady', 'backMatterReady', 'manuscriptReady', 'revisionReady', 'exportReady',
] as const;

function calculateReadinessScore(data: Record<string, unknown>): number {
  let count = 0;
  for (const field of CHECKLIST_FIELDS) {
    if (data[field] === true) count++;
  }
  return count;
}

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

    const checklist = await db.publishingChecklist.findUnique({
      where: { projectId },
    });

    return NextResponse.json(checklist || {});
  } catch (error) {
    console.error('Error fetching checklist:', error);
    return NextResponse.json({ error: 'Failed to fetch checklist' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = updateChecklistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectId, ...data } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project || project.userId !== userId) {
      return new Response(null, { status: 403 });
    }

    const readinessScore = calculateReadinessScore(data);

    const checklist = await db.publishingChecklist.upsert({
      where: { projectId },
      update: { ...data, readinessScore, lastCheckedAt: new Date() },
      create: { projectId, ...data, readinessScore, lastCheckedAt: new Date() },
    });

    return NextResponse.json(checklist);
  } catch (error) {
    console.error('Error updating checklist:', error);
    return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 });
  }
}
