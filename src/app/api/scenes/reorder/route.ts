import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { reorderScenesSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = reorderScenesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { items } = parsed.data;

    for (const item of items) {
      const scene = await db.scene.findUnique({ where: { id: item.id } });
      if (!scene) {
        return NextResponse.json({ error: `Scene ${item.id} not found` }, { status: 404 });
      }

      const chapter = await db.chapter.findUnique({ where: { id: scene.chapterId }, select: { projectId: true } });
      if (!chapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }

      const project = await db.project.findUnique({ where: { id: chapter.projectId }, select: { userId: true } });
      if (!project || project.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    await db.$transaction(
      items.map((item) =>
        db.scene.update({
          where: { id: item.id },
          data: { sceneNumber: item.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering scenes:', error);
    return NextResponse.json({ error: 'Failed to reorder scenes' }, { status: 500 });
  }
}
