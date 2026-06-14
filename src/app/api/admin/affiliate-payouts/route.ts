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

    const where: Record<string, any> = {};

    if (status && ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    const [payouts, total] = await Promise.all([
      db.affiliatePayout.findMany({
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
          items: {
            include: {
              commission: {
                select: {
                  id: true,
                  plan: true,
                  commissionAmount: true,
                  status: true,
                },
              },
            },
          },
        },
      }),
      db.affiliatePayout.count({ where }),
    ]);

    const serialized = payouts.map((p) => ({
      ...p,
      amount: Number(p.amount),
    }));

    return NextResponse.json({
      payouts: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin payouts list error:', error);
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const body = await request.json();
    const { affiliateId, commissionIds } = body;

    if (!affiliateId || !commissionIds || !Array.isArray(commissionIds) || commissionIds.length === 0) {
      return NextResponse.json({ error: 'affiliateId and commissionIds are required' }, { status: 400 });
    }

    const affiliate = await db.affiliateProfile.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    const commissions = await db.affiliateCommission.findMany({
      where: {
        id: { in: commissionIds },
        affiliateId,
        status: 'PAYABLE',
      },
    });

    if (commissions.length !== commissionIds.length) {
      return NextResponse.json(
        { error: 'Some commissions are invalid, not found, or not in PAYABLE status' },
        { status: 400 }
      );
    }

    const totalAmount = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);

    const payout = await db.$transaction(async (tx) => {
      const created = await tx.affiliatePayout.create({
        data: {
          affiliateId,
          amount: totalAmount,
          currency: 'USD',
          status: 'PENDING',
          items: {
            create: commissions.map((c) => ({
              commissionId: c.id,
              amount: Number(c.commissionAmount),
            })),
          },
        },
        include: {
          items: true,
        },
      });

      await tx.affiliateCommission.updateMany({
        where: { id: { in: commissionIds } },
        data: { status: 'PAID' },
      });

      await tx.affiliateProfile.update({
        where: { id: affiliateId },
        data: {
          totalCommissionPaid: { increment: totalAmount },
        },
      });

      return created;
    });

    await db.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        targetUserId: affiliate.userId,
        action: 'CREATE_PAYOUT',
        metadataJson: JSON.stringify({
          payoutId: payout.id,
          affiliateId,
          commissionIds,
          totalAmount,
        }),
      },
    });

    return NextResponse.json(
      {
        ...payout,
        amount: Number(payout.amount),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin payout create error:', error);
    return NextResponse.json({ error: 'Failed to create payout' }, { status: 500 });
  }
}
