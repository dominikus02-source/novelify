import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const profile = await db.affiliateProfile.findUnique({
      where: { code: code.toLowerCase().trim() },
      select: {
        id: true,
        status: true,
        user: { select: { name: true } },
      },
    });

    if (!profile || profile.status !== 'ACTIVE') {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      affiliateName: profile.user.name,
    });
  } catch (error) {
    console.error('Validate code error:', error);
    return NextResponse.json({ error: 'Failed to validate code' }, { status: 500 });
  }
}
