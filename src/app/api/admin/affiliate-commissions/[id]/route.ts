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

    if (!status || !['APPROVED', 'PAYABLE'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be APPROVED or PAYABLE' }, { status: 400 });
    }

    const existing = await db.affiliateCommission.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    const updated = await db.affiliateCommission.update({
      where: { id },
      data: { status },
    });

    await db.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: 'UPDATE_COMMISSION_STATUS',
        metadataJson: JSON.stringify({
          commissionId: id,
          previousStatus: existing.status,
          newStatus: status,
        }),
      },
    });

    return NextResponse.json({
      ...updated,
      grossAmount: Number(updated.grossAmount),
      netAmount: updated.netAmount ? Number(updated.netAmount) : null,
      commissionRate: Number(updated.commissionRate),
      commissionAmount: Number(updated.commissionAmount),
    });
  } catch (error) {
    console.error('Admin commission update error:', error);
    return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 });
  }
}
