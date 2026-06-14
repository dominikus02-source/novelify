import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.affiliateProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Affiliate profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { payoutMethod, payoutEmail, payoutName, payoutNotes } = body;

    const updateData: Record<string, any> = {};
    if (payoutMethod !== undefined) updateData.payoutMethod = payoutMethod;
    if (payoutEmail !== undefined) updateData.payoutEmail = payoutEmail;
    if (payoutName !== undefined) updateData.payoutName = payoutName;
    if (payoutNotes !== undefined) updateData.payoutNotes = payoutNotes;

    const updated = await db.affiliateProfile.update({
      where: { id: profile.id },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      commissionRate: Number(updated.commissionRate),
      totalCommissionEarned: Number(updated.totalCommissionEarned),
      totalCommissionPaid: Number(updated.totalCommissionPaid),
    });
  } catch (error) {
    console.error('Affiliate profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
