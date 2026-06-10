import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createRelationshipSchema } from '@/lib/validations';
import { getUserId } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId query parameter is required' }, { status: 400 });
    }

    const relationships = await db.relationship.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    const serialized = relationships.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching relationships:', error);
    return NextResponse.json({ error: 'Failed to fetch relationships' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = createRelationshipSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectId, characterAId, characterBId, type, description, conflict, evolution } = parsed.data;

    const project = await db.project.findUnique({ where: { id: projectId }, select: { userId: true } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const relationship = await db.relationship.create({
      data: { projectId, characterAId, characterBId, type, description, conflict, evolution },
    });

    const serialized = {
      ...relationship,
      createdAt: relationship.createdAt.toISOString(),
      updatedAt: relationship.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error creating relationship:', error);
    return NextResponse.json({ error: 'Failed to create relationship' }, { status: 500 });
  }
}
