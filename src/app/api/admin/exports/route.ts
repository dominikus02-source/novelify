import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assertAdminAccess } from '@/lib/admin/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || '';
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (format) where.format = format;
    if (status) where.status = status;

    const [exports, total] = await Promise.all([
      db.exportJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          format: true,
          status: true,
          fileName: true,
          fileSize: true,
          createdAt: true,
          completedAt: true,
          user: { select: { id: true, email: true, name: true } },
          project: { select: { id: true, title: true } },
        },
      }),
      db.exportJob.count({ where }),
    ]);

    const serialized = exports.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      completedAt: e.completedAt?.toISOString() || null,
    }));

    return NextResponse.json({
      exports: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin exports error:', error);
    return NextResponse.json({ error: 'Failed to fetch exports' }, { status: 500 });
  }
}
