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
      return NextResponse.json({ error: 'Affiliate profile not found' }, { status: 404 });
    }

    const referrals = await db.affiliateReferral.findMany({
      where: { affiliateId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        referralCode: true,
        status: true,
        signupAt: true,
        convertedAt: true,
        commissionEndsAt: true,
        createdAt: true,
        referredUser: {
          select: { email: true },
        },
      },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.error('Affiliate referrals error:', error);
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
  }
}
