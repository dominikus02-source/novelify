import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.manuscriptVersion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    await db.manuscriptVersion.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting version:', error);
    return NextResponse.json({ error: 'Failed to delete version' }, { status: 500 });
  }
}
