import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateProjectSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

// GET /api/projects/[id] - Get a project
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) return new Response(null, { status: 401 });

    const { id } = await params;

    const project = await db.project.findUnique({
      where: { id },
      include: {
        chapters: true,
        characters: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== userId) return new Response(null, { status: 403 });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) return new Response(null, { status: 401 });

    const { id } = await params;

    const project = await db.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== userId) return new Response(null, { status: 403 });

    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedProject = await db.project.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        userId: true,
        title: true,
        genre: true,
        sourceLanguage: true,
        targetLanguage: true,
        status: true,
        plotOutline: true,
        styleGuide: true,
        coverImage: true,
        wordTarget: true,
        chaptersTarget: true,
        templateId: true,
        premise: true,
        logline: true,
        theme: true,
        targetAudience: true,
        pov: true,
        tense: true,
        tone: true,
        centralConflict: true,
        stakes: true,
        endingIdea: true,
        createdAt: true,
        updatedAt: true,
        chapters: {
          select: {
            id: true,
            projectId: true,
            chapterNumber: true,
            title: true,
            contentOriginal: true,
            contentTranslated: true,
            wordCount: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        characters: {
          select: {
            id: true,
            projectId: true,
            name: true,
            description: true,
            role: true,
            age: true,
            gender: true,
            occupation: true,
            physicalDescription: true,
            personality: true,
            motivation: true,
            fear: true,
            secret: true,
            flaw: true,
            strength: true,
            backstory: true,
            characterArc: true,
            relationshipToProtagonist: true,
            firstAppearanceChapter: true,
            status: true,
            notes: true,
            imageUrl: true,
            colorTag: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Serialize dates
    const serialized = {
      ...updatedProject,
      createdAt: updatedProject.createdAt.toISOString(),
      updatedAt: updatedProject.updatedAt.toISOString(),
      chapters: updatedProject.chapters.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      characters: updatedProject.characters.map((ch) => ({
        ...ch,
        createdAt: ch.createdAt.toISOString(),
        updatedAt: ch.updatedAt.toISOString(),
      })),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) return new Response(null, { status: 401 });

    const { id } = await params;

    const project = await db.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== userId) return new Response(null, { status: 403 });

    await db.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
