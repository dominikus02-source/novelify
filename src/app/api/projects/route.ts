import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createProjectSchema } from '@/lib/validations';
import { getUserId, unauthorized } from '@/lib/session';

// GET /api/projects - Fetch all projects for the authenticated user
export async function GET() {
  try {
    const userId = await getUserId();

    const projects = await db.project.findMany({
      where: { userId },
      include: {
        chapters: true,
        characters: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const serialized = projects.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      chapters: p.chapters.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      characters: p.characters.map((ch) => ({
        ...ch,
        createdAt: ch.createdAt.toISOString(),
        updatedAt: ch.updatedAt.toISOString(),
      })),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorized();
    }
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, genre, sourceLanguage, targetLanguage, plotOutline, styleGuide } = parsed.data;

    const project = await db.project.create({
      data: {
        userId,
        title,
        genre: genre || null,
        sourceLanguage,
        targetLanguage,
        plotOutline: plotOutline || null,
        styleGuide: styleGuide || null,
        status: 'draft',
      },
      include: {
        chapters: true,
        characters: true,
      },
    });

    const serialized = {
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      chapters: project.chapters.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      characters: project.characters.map((ch) => ({
        ...ch,
        createdAt: ch.createdAt.toISOString(),
        updatedAt: ch.updatedAt.toISOString(),
      })),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorized();
    }
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
