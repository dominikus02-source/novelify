import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { assertAdminAccess } from '@/lib/admin/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const profile = await db.affiliateProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            referrals: true,
            commissions: true,
            clicks: true,
            payouts: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...profile,
      commissionRate: Number(profile.commissionRate),
      totalCommissionEarned: Number(profile.totalCommissionEarned),
      totalCommissionPaid: Number(profile.totalCommissionPaid),
    });
  } catch (error) {
    console.error('Admin affiliate get error:', error);
    return NextResponse.json({ error: 'Failed to fetch affiliate' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;
    const body = await request.json();

    const existing = await db.affiliateProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    if (body.status !== undefined) {
      const validStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = body.status;
      if (body.status === 'ACTIVE') {
        updateData.approvedAt = new Date();
      }
    }

    if (body.tier !== undefined) {
      const validTiers = ['STANDARD', 'TOP_PARTNER', 'CUSTOM'];
      if (!validTiers.includes(body.tier)) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }
      updateData.tier = body.tier;
    }

    if (body.commissionRate !== undefined) {
      const rate = parseFloat(body.commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 1) {
        return NextResponse.json({ error: 'Invalid commission rate (0-1)' }, { status: 400 });
      }
      updateData.commissionRate = rate;
    }

    if (body.approvedAt !== undefined) {
      updateData.approvedAt = body.approvedAt ? new Date(body.approvedAt) : null;
    }

    const updated = await db.affiliateProfile.update({
      where: { id },
      data: updateData,
    });

    await db.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        targetUserId: existing.userId,
        action: 'UPDATE_AFFILIATE',
        metadataJson: JSON.stringify({
          affiliateId: id,
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
