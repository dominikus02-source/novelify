import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateProjectOverviewSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const project = await db.project.findUnique({ where: { id }, select: { userId: true } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateProjectOverviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedProject = await db.project.update({
      where: { id },
      data: parsed.data,
    });

    const serialized = {
      ...updatedProject,
      createdAt: updatedProject.createdAt.toISOString(),
      updatedAt: updatedProject.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error updating project overview:', error);
    return NextResponse.json({ error: 'Failed to update project overview' }, { status: 500 });
  }
}
