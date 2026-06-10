import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateFrontMatterSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId query parameter is required' }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project || project.userId !== userId) {
      return new Response(null, { status: 403 });
    }

    const frontMatter = await db.frontMatter.findUnique({
      where: { projectId },
    });

    return NextResponse.json(frontMatter || {});
  } catch (error) {
    console.error('Error fetching front matter:', error);
    return NextResponse.json({ error: 'Failed to fetch front matter' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = updateFrontMatterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectId, ...data } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project || project.userId !== userId) {
      return new Response(null, { status: 403 });
    }

    const frontMatter = await db.frontMatter.upsert({
      where: { projectId },
      update: data,
      create: { projectId, ...data },
    });

    return NextResponse.json(frontMatter);
  } catch (error) {
    console.error('Error updating front matter:', error);
    return NextResponse.json({ error: 'Failed to update front matter' }, { status: 500 });
  }
}
