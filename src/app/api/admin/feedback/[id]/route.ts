import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assertAdminAccess } from '@/lib/admin/admin-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;
    const body = await request.json();
    const { status, priority, adminNote } = body;

    const updateData: any = {};
    if (status && ['NEW', 'REVIEWED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'].includes(status)) {
      updateData.status = status;
    }
    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
      updateData.priority = priority;
    }
    if (adminNote !== undefined) {
      updateData.adminNote = adminNote;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await db.feedback.update({
      where: { id },
      data: updateData,
      select: { id: true, status: true, priority: true, adminNote: true },
    });

    await db.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: `Updated feedback ${id}: ${JSON.stringify(updateData)}`,
        metadataJson: JSON.stringify(updateData),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin feedback update error:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}
