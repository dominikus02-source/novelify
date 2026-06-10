import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

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
    const { contentOriginal, contentTranslated, title, wordCount, status } = body;

    // Build update data with only provided fields
    const updateData: Record<string, unknown> = {};
    if (contentOriginal !== undefined) updateData.contentOriginal = contentOriginal;
    if (contentTranslated !== undefined) updateData.contentTranslated = contentTranslated;
    if (title !== undefined) updateData.title = title;
    if (wordCount !== undefined) updateData.wordCount = Number(wordCount);
    if (status !== undefined) updateData.status = status;

    const updatedChapter = await db.chapter.update({
      where: { id },
      data: updateData,
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
