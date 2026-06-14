import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getCommissionStats } from '@/lib/affiliate/commissions';

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
      return NextResponse.json({ error: 'Affiliate profile not found' }, { status: 404 });
    }

    const commissionStats = await getCommissionStats(profile.id);

    return NextResponse.json({
      clicks: profile.totalClicks,
      signups: profile.totalSignups,
      paidCustomers: profile.totalPaidCustomers,
      ...commissionStats,
    });
  } catch (error) {
    console.error('Affiliate stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
