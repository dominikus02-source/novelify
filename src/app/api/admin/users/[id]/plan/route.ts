import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { assertSuperAdminAccess } from '@/lib/admin/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await assertSuperAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const body = await request.json();
    const { plan } = body as { plan: string };

    if (!plan || typeof plan !== 'string') {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [updatedUser] = await Promise.all([
      db.user.update({
        where: { id },
        data: { plan },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          subscriptionStatus: true,
          createdAt: true,
        },
      }),
      db.billingEvent.create({
        data: {
          userId: id,
          provider: 'manual',
          type: 'plan_manually_changed',
          status: 'active',
          plan,
        },
      }),
      db.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          targetUserId: id,
          action: 'plan_changed',
          metadataJson: JSON.stringify({ from: user.plan, to: plan }),
        },
      }),
    ]);

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
