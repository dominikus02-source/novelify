import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createSceneSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

// GET /api/scenes?chapterId=xxx or /api/scenes?chapterIds=id1,id2,id3
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const chapterId = request.nextUrl.searchParams.get('chapterId');
    const chapterIdsParam = request.nextUrl.searchParams.get('chapterIds');

    if (!chapterId && !chapterIdsParam) {
      return NextResponse.json(
        { error: 'chapterId or chapterIds query parameter is required' },
        { status: 400 }
      );
    }

    const targetChapterIds = chapterId ? [chapterId] : chapterIdsParam!.split(',').filter(Boolean);

    const chapters = await db.chapter.findMany({
      where: { id: { in: targetChapterIds } },
      select: { project: { select: { userId: true } } },
    });
    if (chapters.length === 0 || chapters.some((c) => c.project.userId !== userId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const scenes = await db.scene.findMany({
      where: { chapterId: { in: targetChapterIds } },
      orderBy: { sceneNumber: 'asc' },
    });

    const serialized = scenes.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching scenes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenes' },
      { status: 500 }
    );
  }
}

// POST /api/scenes - Create a new scene
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = createSceneSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { chapterId, sceneNumber, title } = parsed.data;

    const chapter = await db.chapter.findUnique({ where: { id: chapterId }, select: { project: { select: { userId: true } } } });
    if (!chapter || chapter.project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const scene = await db.scene.create({
      data: {
        chapterId,
        sceneNumber,
        title,
        content: '',
        wordCount: 0,
        status: 'idea',
      },
    });

    const serialized = {
      ...scene,
      createdAt: scene.createdAt.toISOString(),
      updatedAt: scene.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error creating scene:', error);
    return NextResponse.json(
      { error: 'Failed to create scene' },
      { status: 500 }
    );
  }
}
