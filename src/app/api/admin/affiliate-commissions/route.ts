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
    const affiliateId = searchParams.get('affiliateId') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};

    if (status && ['PENDING', 'APPROVED', 'PAYABLE', 'PAID', 'REVERSED', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    if (affiliateId) {
      where.affiliateId = affiliateId;
    }

    const [commissions, total] = await Promise.all([
      db.affiliateCommission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          affiliate: {
            select: {
              id: true,
              code: true,
              user: {
                select: { id: true, email: true, name: true },
              },
            },
          },
        },
      }),
      db.affiliateCommission.count({ where }),
    ]);

    const serialized = commissions.map((c) => ({
      ...c,
      grossAmount: Number(c.grossAmount),
      netAmount: c.netAmount ? Number(c.netAmount) : null,
      commissionRate: Number(c.commissionRate),
      commissionAmount: Number(c.commissionAmount),
    }));

    return NextResponse.json({
      commissions: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin affiliate commissions error:', error);
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 });
  }
}
