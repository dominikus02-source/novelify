import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assertAdminAccess } from '@/lib/admin/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && ['NEW', 'REVIEWED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'].includes(status)) {
      where.status = status as any;
    }

    const [feedback, total] = await Promise.all([
      db.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          category: true,
          message: true,
          status: true,
          priority: true,
          adminNote: true,
          pageUrl: true,
          createdAt: true,
          user: { select: { id: true, email: true, name: true } },
          project: { select: { id: true, title: true } },
        },
      }),
      db.feedback.count({ where }),
    ]);

    const serialized = feedback.map((f) => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
    }));

    return NextResponse.json({
      feedback: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin feedback error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
