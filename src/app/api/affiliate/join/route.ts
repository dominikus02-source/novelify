import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createAffiliateProfileForUser } from '@/lib/affiliate/affiliate-code';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await db.affiliateProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json({ error: 'Affiliate profile already exists' }, { status: 409 });
    }

    const { profile } = await createAffiliateProfileForUser(session.user.id, {
      tier: 'STANDARD',
    });

    return NextResponse.json(
      {
        ...profile,
        commissionRate: Number(profile.commissionRate),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Affiliate join error:', error);
    return NextResponse.json({ error: 'Failed to create affiliate profile' }, { status: 500 });
  }
}
