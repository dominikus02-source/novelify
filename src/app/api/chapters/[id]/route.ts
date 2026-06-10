import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateChapterSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

// PATCH /api/chapters/[id] - Update a chapter
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) return new Response(null, { status: 401 });

    const { id } = await params;

    const chapter = await db.chapter.findUnique({ where: { id } });
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    const project = await db.project.findUnique({ where: { id: chapter.projectId } });
    if (!project || project.userId !== userId) return new Response(null, { status: 403 });

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

// DELETE /api/chapters/[id] - Delete a chapter
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) return new Response(null, { status: 401 });

    const { id } = await params;

    const chapter = await db.chapter.findUnique({ where: { id } });
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const project = await db.project.findUnique({ where: { id: chapter.projectId } });
    if (!project || project.userId !== userId) return new Response(null, { status: 403 });

    await db.scene.deleteMany({ where: { chapterId: id } });
    await db.chapter.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      { error: 'Failed to delete chapter' },
      { status: 500 }
    );
  }
}
