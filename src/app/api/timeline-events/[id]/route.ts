import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateTimelineEventSchema } from '@/lib/validations';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.timelineEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Timeline event not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateTimelineEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const updated = await db.timelineEvent.update({
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
    console.error('Error updating timeline event:', error);
    return NextResponse.json({ error: 'Failed to update timeline event' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.timelineEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Timeline event not found' }, { status: 404 });
    }

    await db.timelineEvent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    return NextResponse.json({ error: 'Failed to delete timeline event' }, { status: 500 });
  }
}
