import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { assertSuperAdminAccess } from '@/lib/admin/admin-auth';
import { UserRole } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await assertSuperAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    if (admin.id === id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    const body = await request.json();
    const { role } = body as { role: string };

    if (!Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [updatedUser] = await Promise.all([
      db.user.update({
        where: { id },
        data: { role: role as UserRole },
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
      db.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          targetUserId: id,
          action: 'role_changed',
          metadataJson: JSON.stringify({ from: user.role, to: role }),
        },
      }),
    ]);

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
