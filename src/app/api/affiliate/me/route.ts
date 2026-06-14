import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.affiliateProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ isAffiliate: false });
    }

    const stats = {
      totalClicks: profile.totalClicks,
      totalSignups: profile.totalSignups,
      totalPaidCustomers: profile.totalPaidCustomers,
      totalCommissionEarned: Number(profile.totalCommissionEarned),
      totalCommissionPaid: Number(profile.totalCommissionPaid),
    };

    return NextResponse.json({
      isAffiliate: true,
      ...profile,
      totalCommissionEarned: Number(profile.totalCommissionEarned),
      totalCommissionPaid: Number(profile.totalCommissionPaid),
      commissionRate: Number(profile.commissionRate),
      stats,
    });
  } catch (error) {
    console.error('Affiliate me error:', error);
    return NextResponse.json({ error: 'Failed to fetch affiliate profile' }, { status: 500 });
  }
}
