import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateSceneSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

// PATCH /api/scenes/[id] - Update a scene
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const scene = await db.scene.findUnique({ where: { id } });
    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    const chapter = await db.chapter.findUnique({ where: { id: scene.chapterId }, select: { project: { select: { userId: true } } } });
    if (!chapter || chapter.project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateSceneSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedScene = await db.scene.update({
      where: { id },
      data: parsed.data,
    });

    const serialized = {
      ...updatedScene,
      createdAt: updatedScene.createdAt.toISOString(),
      updatedAt: updatedScene.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error updating scene:', error);
    return NextResponse.json(
      { error: 'Failed to update scene' },
      { status: 500 }
    );
  }
}

// DELETE /api/scenes/[id] - Delete a scene
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const scene = await db.scene.findUnique({ where: { id } });
    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    const chapter = await db.chapter.findUnique({ where: { id: scene.chapterId }, select: { project: { select: { userId: true } } } });
    if (!chapter || chapter.project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.scene.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scene:', error);
    return NextResponse.json(
      { error: 'Failed to delete scene' },
      { status: 500 }
    );
  }
}
