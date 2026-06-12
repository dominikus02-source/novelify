import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const VALID_CATEGORIES = [
  'Bug Report',
  'Feature Request',
  'AI Output Issue',
  'Mobile Issue',
  'Export Issue',
  'Billing Issue',
  'Confusing Flow',
  'General Feedback',
] as const;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    const body = await request.json();
    const { category, message, pageUrl, projectId } = body;

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 },
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }

    const userAgent = request.headers.get('user-agent') ?? undefined;

    await db.feedback.create({
      data: {
        userId,
        projectId: projectId ?? null,
        category,
        message: message.trim(),
        pageUrl: pageUrl ?? null,
        userAgent: userAgent ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
