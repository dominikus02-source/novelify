import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createResearchItemSchema } from '@/lib/validations';
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

    const researchItems = await db.researchItem.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    const serialized = researchItems.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching research items:', error);
    return NextResponse.json({ error: 'Failed to fetch research items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = createResearchItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectId, title, sourceUrl, summary, notes, relevance, linkedCharacterId, linkedLocationId, linkedChapterId } = parsed.data;

    const project = await db.project.findUnique({ where: { id: projectId }, select: { userId: true } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const researchItem = await db.researchItem.create({
      data: { projectId, title, sourceUrl, summary, notes, relevance, linkedCharacterId, linkedLocationId, linkedChapterId },
    });

    const serialized = {
      ...researchItem,
      createdAt: researchItem.createdAt.toISOString(),
      updatedAt: researchItem.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error creating research item:', error);
    return NextResponse.json({ error: 'Failed to create research item' }, { status: 500 });
  }
}
