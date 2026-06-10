import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createPlotBeatSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId query parameter is required' }, { status: 400 });
    }

    const userId = await getUserId();
    if (!userId) return new Response(null, { status: 401 });

    const project = await db.project.findUnique({ where: { id: projectId }, select: { userId: true } });
    if (!project || project.userId !== userId) return new Response(null, { status: 403 });

    const plotBeats = await db.plotBeat.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    const serialized = plotBeats.map((b) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching plot beats:', error);
    return NextResponse.json({ error: 'Failed to fetch plot beats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = createPlotBeatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectId, template, act, order, title, description, status, linkedChapterId, linkedSceneId, notes } = parsed.data;

    const project = await db.project.findUnique({ where: { id: projectId }, select: { userId: true } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const plotBeat = await db.plotBeat.create({
      data: { projectId, template, act, order, title, description, status, linkedChapterId, linkedSceneId, notes },
    });

    const serialized = {
      ...plotBeat,
      createdAt: plotBeat.createdAt.toISOString(),
      updatedAt: plotBeat.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error creating plot beat:', error);
    return NextResponse.json({ error: 'Failed to create plot beat' }, { status: 500 });
  }
}
