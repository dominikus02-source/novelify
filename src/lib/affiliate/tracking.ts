import { db } from '@/lib/db';

export async function trackAffiliateClick(params: {
  referralCode: string;
  visitorId?: string;
  ipHash?: string;
  userAgent?: string;
  landingPage?: string;
  referrer?: string;
}): Promise<{ success: boolean; affiliate?: any }> {
  try {
    const affiliate = await db.affiliateProfile.findUnique({
      where: { code: params.referralCode },
    });

    if (!affiliate) return { success: false };
    if (affiliate.status !== 'ACTIVE') return { success: false };

    const click = await db.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        referralCode: params.referralCode,
        visitorId: params.visitorId,
        ipHash: params.ipHash,
        userAgent: params.userAgent,
        landingPage: params.landingPage,
        referrer: params.referrer,
      },
    });

    await db.affiliateProfile.update({
      where: { id: affiliate.id },
      data: { totalClicks: { increment: 1 } },
    });

    return { success: true, affiliate: { id: affiliate.id, code: affiliate.code, userId: affiliate.userId } };
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return { success: false };
  }
}

export function generateVisitorId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return `vis_${result}`;
}
