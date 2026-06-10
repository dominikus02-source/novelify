import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/chapters?projectId=xxx - Fetch all chapters for a project
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId query parameter is required' },
        { status: 400 }
      );
    }

    const chapters = await db.chapter.findMany({
      where: { projectId },
      orderBy: { chapterNumber: 'asc' },
    });

    // Serialize dates to ISO strings
    const serialized = chapters.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}

// POST /api/chapters - Create a new chapter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, chapterNumber, title } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    if (!chapterNumber) {
      return NextResponse.json(
        { error: 'chapterNumber is required' },
        { status: 400 }
      );
    }

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    // Verify the project exists
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const chapter = await db.chapter.create({
      data: {
        projectId,
        chapterNumber: Number(chapterNumber),
        title: title.trim(),
        contentOriginal: '',
        wordCount: 0,
        status: 'draft',
      },
    });

    // Serialize dates
    const serialized = {
      ...chapter,
      createdAt: chapter.createdAt.toISOString(),
      updatedAt: chapter.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { error: 'Failed to create chapter' },
      { status: 500 }
    );
  }
}
