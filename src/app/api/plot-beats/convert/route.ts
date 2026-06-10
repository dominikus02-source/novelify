import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { convertBeatToChapterSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = convertBeatToChapterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { beatId, title } = parsed.data;

    const beat = await db.plotBeat.findUnique({ where: { id: beatId } });
    if (!beat) {
      return NextResponse.json({ error: 'Plot beat not found' }, { status: 404 });
    }

    const project = await db.project.findUnique({ where: { id: beat.projectId }, select: { userId: true } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const maxChapter = await db.chapter.aggregate({
      where: { projectId: beat.projectId },
      _max: { chapterNumber: true },
    });
    const nextChapterNumber = (maxChapter._max.chapterNumber ?? 0) + 1;

    const chapter = await db.chapter.create({
      data: {
        projectId: beat.projectId,
        chapterNumber: nextChapterNumber,
        title: title ?? beat.title,
        contentOriginal: '',
        wordCount: 0,
        status: 'draft',
      },
    });

    await db.plotBeat.update({
      where: { id: beatId },
      data: { linkedChapterId: chapter.id, status: 'drafted' },
    });

    const serialized = {
      ...chapter,
      createdAt: chapter.createdAt.toISOString(),
      updatedAt: chapter.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error converting beat to chapter:', error);
    return NextResponse.json({ error: 'Failed to convert beat to chapter' }, { status: 500 });
  }
}
