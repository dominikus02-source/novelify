import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createVersionSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return new Response(null, { status: 401 });

    const projectId = request.nextUrl.searchParams.get('projectId');
    const chapterId = request.nextUrl.searchParams.get('chapterId');
    const sceneId = request.nextUrl.searchParams.get('sceneId');

    if (!projectId && !chapterId && !sceneId) {
      return NextResponse.json(
        { error: 'One of projectId, chapterId, or sceneId query parameter is required' },
        { status: 400 }
      );
    }

    let ownerProjectId = projectId;
    if (!ownerProjectId && chapterId) {
      const chapter = await db.chapter.findUnique({ where: { id: chapterId } });
      if (!chapter) return new Response(null, { status: 404 });
      ownerProjectId = chapter.projectId;
    }
    if (!ownerProjectId && sceneId) {
      const scene = await db.scene.findUnique({ where: { id: sceneId } });
      if (!scene) return new Response(null, { status: 404 });
      const chapter = await db.chapter.findUnique({ where: { id: scene.chapterId } });
      if (!chapter) return new Response(null, { status: 404 });
      ownerProjectId = chapter.projectId;
    }
    if (ownerProjectId) {
      const project = await db.project.findUnique({ where: { id: ownerProjectId } });
      if (!project || project.userId !== userId) return new Response(null, { status: 403 });
    }

    const where: Record<string, string> = {};
    if (projectId) where.projectId = projectId;
    if (chapterId) where.chapterId = chapterId;
    if (sceneId) where.sceneId = sceneId;

    const versions = await db.manuscriptVersion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const serialized = versions.map((v) => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return new Response(null, { status: 401 });

    const body = await request.json();
    const parsed = createVersionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectId, chapterId, sceneId, content, wordCount, label } = parsed.data;

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== userId) return new Response(null, { status: 403 });

    const version = await db.manuscriptVersion.create({
      data: { projectId, chapterId, sceneId, content, wordCount, label },
    });

    const serialized = {
      ...version,
      createdAt: version.createdAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 });
  }
}
