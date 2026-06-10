import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createWritingGoalSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId query parameter is required' }, { status: 400 });
    }

    const goals = await db.writingGoal.findMany({
      where: { projectId },
      orderBy: { startDate: 'desc' },
    });

    const serialized = goals.map((g) => ({
      ...g,
      startDate: g.startDate.toISOString(),
      endDate: g.endDate ? g.endDate.toISOString() : null,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching writing goals:', error);
    return NextResponse.json({ error: 'Failed to fetch writing goals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createWritingGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectId, type, targetWords, currentWords, startDate, endDate } = parsed.data;

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const goal = await db.writingGoal.create({
      data: {
        projectId,
        type,
        targetWords,
        currentWords,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    const serialized = {
      ...goal,
      startDate: goal.startDate.toISOString(),
      endDate: goal.endDate ? goal.endDate.toISOString() : null,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Error creating writing goal:', error);
    return NextResponse.json({ error: 'Failed to create writing goal' }, { status: 500 });
  }
}
