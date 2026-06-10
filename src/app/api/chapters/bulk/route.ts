import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createBulkChaptersSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = createBulkChaptersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectId, count, titlePrefix } = parsed.data;

    const project = await db.project.findUnique({ where: { id: projectId }, select: { userId: true } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const maxChapter = await db.chapter.aggregate({
      where: { projectId },
      _max: { chapterNumber: true },
    });
    let nextChapterNumber = (maxChapter._max.chapterNumber ?? 0) + 1;

    const chaptersData = Array.from({ length: count }, () => {
      const num = nextChapterNumber++;
      return {
        projectId,
        chapterNumber: num,
        title: `${titlePrefix} ${num}`,
        contentOriginal: '',
        wordCount: 0,
        status: 'draft',
      };
    });

    await db.chapter.createMany({ data: chaptersData });

    const chapters = await db.chapter.findMany({
      where: { projectId },
      orderBy: { chapterNumber: 'asc' },
      take: count,
      skip: (nextChapterNumber - count) - 1,
    });

    const serialized = chapters.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error creating bulk chapters:', error);
    return NextResponse.json({ error: 'Failed to create bulk chapters' }, { status: 500 });
  }
}
