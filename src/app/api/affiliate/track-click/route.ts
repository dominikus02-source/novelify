import { NextRequest, NextResponse } from 'next/server';
import { trackAffiliateClick } from '@/lib/affiliate/tracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, landingPage, referrer, visitorId } = body;

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json({ error: 'referralCode is required' }, { status: 400 });
    }

    await trackAffiliateClick({
      referralCode,
      landingPage,
      referrer,
      visitorId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    return NextResponse.json({ success: true });
  }
}
