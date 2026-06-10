import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updatePlotBeatSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const existing = await db.plotBeat.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Plot beat not found' }, { status: 404 });
    }

    const project = await db.project.findUnique({ where: { id: existing.projectId }, select: { userId: true } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updatePlotBeatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const updated = await db.plotBeat.update({
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
    console.error('Error updating plot beat:', error);
    return NextResponse.json({ error: 'Failed to update plot beat' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const existing = await db.plotBeat.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Plot beat not found' }, { status: 404 });
    }

    const project = await db.project.findUnique({ where: { id: existing.projectId }, select: { userId: true } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.plotBeat.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plot beat:', error);
    return NextResponse.json({ error: 'Failed to delete plot beat' }, { status: 500 });
  }
}
