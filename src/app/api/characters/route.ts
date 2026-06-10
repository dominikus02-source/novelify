import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createCharacterSchema } from '@/lib/validations';

// GET /api/characters?projectId=xxx - Fetch all characters for a project
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId query parameter is required' },
        { status: 400 }
      );
    }

    const characters = await db.character.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    // Serialize dates to ISO strings
    const serialized = characters.map((ch) => ({
      ...ch,
      createdAt: ch.createdAt.toISOString(),
      updatedAt: ch.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    );
  }
}

// POST /api/characters - Create a new character
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createCharacterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { projectId, name, description, role } = parsed.data;

    // Verify the project exists
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const character = await db.character.create({
      data: {
        projectId,
        name,
        description,
        role,
      },
    });

    // Serialize dates
    const serialized = {
      ...character,
      createdAt: character.createdAt.toISOString(),
      updatedAt: character.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    );
  }
}
