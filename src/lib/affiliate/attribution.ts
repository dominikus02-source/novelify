import { db } from '@/lib/db';

export async function validateReferralForSignup(userId: string, affiliate: { userId: string; email?: string }): Promise<{ valid: boolean; reason?: string }> {
  if (affiliate.userId === userId) {
    return { valid: false, reason: 'self_referral' };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const affiliateUser = await db.user.findUnique({
    where: { id: affiliate.userId },
    select: { email: true },
  });

  if (user?.email && affiliateUser?.email && user.email.toLowerCase() === affiliateUser.email.toLowerCase()) {
    return { valid: false, reason: 'self_referral' };
  }

  const existingReferral = await db.affiliateReferral.findUnique({
    where: { referredUserId: userId },
  });

  if (existingReferral) {
    return { valid: false, reason: 'already_referred' };
  }

  return { valid: true };
}

export async function attributeSignupToAffiliate(
  userId: string,
  referralCode: string,
  options?: { visitorId?: string; firstClickAt?: Date }
): Promise<{ success: boolean; reason?: string; referral?: any }> {
  try {
    const affiliate = await db.affiliateProfile.findUnique({
      where: { code: referralCode },
    });

    if (!affiliate) return { success: false, reason: 'invalid_code' };
    if (affiliate.status !== 'ACTIVE') return { success: false, reason: 'affiliate_not_active' };

    const validation = await validateReferralForSignup(userId, { userId: affiliate.userId });
    if (!validation.valid) return { success: false, reason: validation.reason };

    const existingReferral = await db.affiliateReferral.findUnique({
      where: { referredUserId: userId },
    });

    if (existingReferral) return { success: false, reason: 'already_referred' };

    const referral = await db.affiliateReferral.create({
      data: {
        affiliateId: affiliate.id,
        referredUserId: userId,
        referralCode,
        visitorId: options?.visitorId,
        firstClickAt: options?.firstClickAt,
        signupAt: new Date(),
        status: 'SIGNED_UP',
      },
    });

    await db.affiliateProfile.update({
      where: { id: affiliate.id },
      data: { totalSignups: { increment: 1 } },
    });

    return { success: true, referral };
  } catch (error) {
    console.error('Error attributing signup to affiliate:', error);
    return { success: false, reason: 'internal_error' };
  }
}

export async function disqualifySelfReferral(referralId: string): Promise<void> {
  await db.affiliateReferral.update({
    where: { id: referralId },
    data: {
      status: 'DISQUALIFIED',
      disqualifiedReason: 'self_referral',
    },
  });
}
