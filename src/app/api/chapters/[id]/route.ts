import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateChapterSchema } from '@/lib/validations';

// PATCH /api/chapters/[id] - Update a chapter
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const chapter = await db.chapter.findUnique({ where: { id } });
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateChapterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedChapter = await db.chapter.update({
      where: { id },
      data: parsed.data,
    });

    // Serialize dates
    const serialized = {
      ...updatedChapter,
      createdAt: updatedChapter.createdAt.toISOString(),
      updatedAt: updatedChapter.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json(
      { error: 'Failed to update chapter' },
      { status: 500 }
    );
  }
}
