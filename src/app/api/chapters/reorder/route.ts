import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { reorderChaptersSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = reorderChaptersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { items } = parsed.data;

    for (const item of items) {
      const chapter = await db.chapter.findUnique({
        where: { id: item.id },
        select: { project: { select: { userId: true } } },
      });
      if (!chapter || chapter.project.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    await db.$transaction(
      items.map((item) =>
        db.chapter.update({
          where: { id: item.id },
          data: { chapterNumber: item.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering chapters:', error);
    return NextResponse.json({ error: 'Failed to reorder chapters' }, { status: 500 });
  }
}
