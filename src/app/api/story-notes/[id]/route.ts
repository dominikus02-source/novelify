import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateStoryNoteSchema } from '@/lib/validations';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.storyNote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Story note not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateStoryNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const updated = await db.storyNote.update({
      where: { id },
      data: parsed.data,
    });

    const serialized = {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error updating story note:', error);
    return NextResponse.json({ error: 'Failed to update story note' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.storyNote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Story note not found' }, { status: 404 });
    }

    await db.storyNote.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story note:', error);
    return NextResponse.json({ error: 'Failed to delete story note' }, { status: 500 });
  }
}
