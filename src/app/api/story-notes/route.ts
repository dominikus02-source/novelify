import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createStoryNoteSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId query parameter is required' }, { status: 400 });
    }

    const notes = await db.storyNote.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });

    const serialized = notes.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching story notes:', error);
    return NextResponse.json({ error: 'Failed to fetch story notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createStoryNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectId, title, content, category, linkedChapterId, linkedSceneId } = parsed.data;

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const note = await db.storyNote.create({
      data: { projectId, title, content, category, linkedChapterId, linkedSceneId },
    });

    const serialized = {
      ...note,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error creating story note:', error);
    return NextResponse.json({ error: 'Failed to create story note' }, { status: 500 });
  }
}
