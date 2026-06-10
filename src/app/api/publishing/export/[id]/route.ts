import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const exportJob = await db.exportJob.findUnique({
      where: { id },
      include: { project: { select: { userId: true } } },
    });

    if (!exportJob) {
      return new Response(null, { status: 404 });
    }

    if (exportJob.project.userId !== userId) {
      return new Response(null, { status: 403 });
    }

    const { project: _project, ...job } = exportJob;
    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching export job:', error);
    return NextResponse.json({ error: 'Failed to fetch export job' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const exportJob = await db.exportJob.findUnique({
      where: { id },
      include: { project: { select: { userId: true } } },
    });

    if (!exportJob) {
      return new Response(null, { status: 404 });
    }

    if (exportJob.project.userId !== userId) {
      return new Response(null, { status: 403 });
    }

    const body = await request.json();

    const updated = await db.exportJob.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating export job:', error);
    return NextResponse.json({ error: 'Failed to update export job' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const exportJob = await db.exportJob.findUnique({
      where: { id },
      include: { project: { select: { userId: true } } },
    });

    if (!exportJob) {
      return new Response(null, { status: 404 });
    }

    if (exportJob.project.userId !== userId) {
      return new Response(null, { status: 403 });
    }

    await db.exportJob.delete({
      where: { id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting export job:', error);
    return NextResponse.json({ error: 'Failed to delete export job' }, { status: 500 });
  }
}
