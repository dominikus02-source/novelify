import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) return new Response(null, { status: 401 });

    const { id } = await params;

    const existing = await db.manuscriptVersion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    const project = await db.project.findUnique({ where: { id: existing.projectId } });
    if (!project || project.userId !== userId) return new Response(null, { status: 403 });

    await db.manuscriptVersion.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting version:', error);
    return NextResponse.json({ error: 'Failed to delete version' }, { status: 500 });
  }
}
