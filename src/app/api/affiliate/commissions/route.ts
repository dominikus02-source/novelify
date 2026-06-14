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

    const commissions = await db.affiliateCommission.findMany({
      where: { affiliateId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const serialized = commissions.map((c) => ({
      ...c,
      grossAmount: Number(c.grossAmount),
      netAmount: c.netAmount ? Number(c.netAmount) : null,
      commissionRate: Number(c.commissionRate),
      commissionAmount: Number(c.commissionAmount),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Affiliate commissions error:', error);
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 });
  }
}
