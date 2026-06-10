import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createTimelineEventSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId query parameter is required' }, { status: 400 });
    }

    const project = await db.project.findUnique({ where: { id: projectId }, select: { userId: true } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const events = await db.timelineEvent.findMany({
      where: { projectId },
      orderBy: { eventDateOrOrder: 'asc' },
    });

    const serialized = events.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = createTimelineEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectId, title, description, eventDateOrOrder, linkedSceneId } = parsed.data;

    const project = await db.project.findUnique({ where: { id: projectId }, select: { userId: true } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const event = await db.timelineEvent.create({
      data: { projectId, title, description, eventDateOrOrder, linkedSceneId },
    });

    const serialized = {
      ...event,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 });
  }
}
