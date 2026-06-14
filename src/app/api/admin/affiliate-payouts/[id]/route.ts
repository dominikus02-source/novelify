import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { assertAdminAccess } from '@/lib/admin/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['PROCESSING', 'PAID', 'FAILED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PROCESSING, PAID, FAILED, or CANCELLED' },
        { status: 400 }
      );
    }

    const existing = await db.affiliatePayout.findUnique({
      where: { id },
      include: {
        items: { select: { commissionId: true, amount: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = { status };

    if (status === 'PAID') {
      updateData.paidAt = new Date();
    }

    if (status === 'CANCELLED' && existing.status !== 'CANCELLED') {
      await db.$transaction(async (tx) => {
        await tx.affiliatePayout.update({
          where: { id },
          data: updateData,
        });

        const commissionIds = existing.items.map((item) => item.commissionId);

        await tx.affiliateCommission.updateMany({
          where: { id: { in: commissionIds } },
          data: { status: 'PAYABLE' },
        });

        const totalAmount = existing.items.reduce((sum, item) => sum + Number(item.amount), 0);

        await tx.affiliateProfile.update({
          where: { id: existing.affiliateId },
          data: {
            totalCommissionPaid: { decrement: totalAmount },
          },
        });
      });
    } else {
      await db.affiliatePayout.update({
        where: { id },
        data: updateData,
      });
    }

    const updated = await db.affiliatePayout.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            commission: {
              select: { id: true, status: true },
            },
          },
        },
      },
    });

    await db.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: 'UPDATE_PAYOUT_STATUS',
        metadataJson: JSON.stringify({
          payoutId: id,
          previousStatus: existing.status,
          newStatus: status,
        }),
      },
    });

    return NextResponse.json({
      ...updated,
      amount: Number(updated!.amount),
    });
  } catch (error) {
    console.error('Admin payout update error:', error);
    return NextResponse.json({ error: 'Failed to update payout' }, { status: 500 });
  }
}
