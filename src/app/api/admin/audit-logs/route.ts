import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assertAdminAccess } from '@/lib/admin/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      db.adminAuditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          metadataJson: true,
          createdAt: true,
          adminUser: { select: { id: true, email: true, name: true } },
          targetUser: { select: { id: true, email: true, name: true } },
        },
      }),
      db.adminAuditLog.count(),
    ]);

    const serialized = logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json({
      logs: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin audit logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
