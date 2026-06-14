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
    const tier = searchParams.get('tier') || '';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};

    if (status && ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'].includes(status)) {
      where.status = status;
    }

    if (tier && ['STANDARD', 'TOP_PARTNER', 'CUSTOM'].includes(tier)) {
      where.tier = tier;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [profiles, total] = await Promise.all([
      db.affiliateProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
          _count: {
            select: {
              referrals: true,
              commissions: true,
              clicks: true,
            },
          },
        },
      }),
      db.affiliateProfile.count({ where }),
    ]);

    const serialized = profiles.map((p) => ({
      ...p,
      commissionRate: Number(p.commissionRate),
      totalCommissionEarned: Number(p.totalCommissionEarned),
      totalCommissionPaid: Number(p.totalCommissionPaid),
    }));

    return NextResponse.json({
      affiliates: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin affiliates list error:', error);
    return NextResponse.json({ error: 'Failed to fetch affiliates' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const body = await request.json();
    const { affiliateId, status, tier, commissionRate, approvedAt } = body;

    if (!affiliateId) {
      return NextResponse.json({ error: 'affiliateId is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (status !== undefined) updateData.status = status;
    if (tier !== undefined) updateData.tier = tier;
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
    if (approvedAt !== undefined) updateData.approvedAt = new Date(approvedAt);

    const updated = await db.affiliateProfile.update({
      where: { id: affiliateId },
      data: updateData,
    });

    await db.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: 'UPDATE_AFFILIATE',
        metadataJson: JSON.stringify({
          affiliateId,
          changes: updateData,
        }),
      },
    });

    return NextResponse.json({
      ...updated,
      commissionRate: Number(updated.commissionRate),
      totalCommissionEarned: Number(updated.totalCommissionEarned),
      totalCommissionPaid: Number(updated.totalCommissionPaid),
    });
  } catch (error) {
    console.error('Admin affiliate update error:', error);
    return NextResponse.json({ error: 'Failed to update affiliate' }, { status: 500 });
  }
}
