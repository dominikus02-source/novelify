import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateWritingGoalSchema } from '@/lib/validations';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.writingGoal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Writing goal not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateWritingGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const updated = await db.writingGoal.update({
      where: { id },
      data: parsed.data,
    });

    const serialized = {
      ...updated,
      startDate: updated.startDate.toISOString(),
      endDate: updated.endDate ? updated.endDate.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error updating writing goal:', error);
    return NextResponse.json({ error: 'Failed to update writing goal' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.writingGoal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Writing goal not found' }, { status: 404 });
    }

    await db.writingGoal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting writing goal:', error);
    return NextResponse.json({ error: 'Failed to delete writing goal' }, { status: 500 });
  }
}
