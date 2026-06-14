import { db } from '@/lib/db';
import { getEffectiveCommissionRate } from './affiliate-code';

export async function processAffiliateCommission(params: {
  referredUserId: string;
  provider: string;
  providerOrderId?: string;
  providerSubscriptionId?: string;
  plan: string;
  grossAmount: number;
  netAmount?: number;
  currency: string;
  billingEventId?: string;
}): Promise<{ success: boolean; commission?: any; reason?: string }> {
  try {
    const referral = await db.affiliateReferral.findUnique({
      where: { referredUserId: params.referredUserId },
      include: { affiliate: true },
    });

    if (!referral) return { success: false, reason: 'no_referral' };
    if (referral.status !== 'SIGNED_UP' && referral.status !== 'CONVERTED') {
      return { success: false, reason: `invalid_referral_status: ${referral.status}` };
    }
    if (referral.affiliate.status !== 'ACTIVE') {
      return { success: false, reason: 'affiliate_not_active' };
    }

    const now = new Date();

    if (referral.commissionEndsAt && now > referral.commissionEndsAt) {
      return { success: false, reason: 'commission_period_expired' };
    }

    const existingCommission = await db.affiliateCommission.findFirst({
      where: {
        affiliateId: referral.affiliateId,
        referredUserId: params.referredUserId,
        providerOrderId: params.providerOrderId,
      },
    });

    if (existingCommission) {
      return { success: false, reason: 'duplicate_commission' };
    }

    const commissionRate = await getEffectiveCommissionRate({
      tier: referral.affiliate.tier,
      commissionRate: referral.affiliate.commissionRate,
    });

    const grossDecimal = params.grossAmount;
    const commissionAmount = grossDecimal * commissionRate;

    if (referral.status === 'SIGNED_UP') {
      const commissionEndsAt = new Date(now.getTime());
      commissionEndsAt.setMonth(commissionEndsAt.getMonth() + referral.affiliate.commissionDurationMonths);

      await db.affiliateReferral.update({
        where: { id: referral.id },
        data: {
          status: 'CONVERTED',
          convertedAt: now,
          commissionEndsAt,
        },
      });

      await db.affiliateProfile.update({
        where: { id: referral.affiliateId },
        data: { totalPaidCustomers: { increment: 1 } },
      });
    }

    const commission = await db.affiliateCommission.create({
      data: {
        affiliateId: referral.affiliateId,
        referredUserId: params.referredUserId,
        subscriptionId: referral.id,
        billingEventId: params.billingEventId,
        provider: params.provider,
        providerOrderId: params.providerOrderId,
        providerSubscriptionId: params.providerSubscriptionId,
        plan: params.plan,
        grossAmount: grossDecimal,
        netAmount: params.netAmount ?? null,
        currency: params.currency,
        commissionRate,
        commissionAmount,
        status: 'PENDING',
        eligibleAt: now,
      },
    });

    await db.affiliateProfile.update({
      where: { id: referral.affiliateId },
      data: { totalCommissionEarned: { increment: commissionAmount } },
    });

    return { success: true, commission };
  } catch (error) {
    console.error('Error processing affiliate commission:', error);
    return { success: false, reason: 'internal_error' };
  }
}

export async function reverseAffiliateCommission(params: {
  providerOrderId?: string;
  providerSubscriptionId?: string;
  referredUserId?: string;
  reason?: string;
}): Promise<{ success: boolean; count: number }> {
  try {
    const where: any = {};
    if (params.providerOrderId) where.providerOrderId = params.providerOrderId;
    if (params.providerSubscriptionId) where.providerSubscriptionId = params.providerSubscriptionId;
    if (params.referredUserId) where.referredUserId = params.referredUserId;

    const commissions = await db.affiliateCommission.findMany({ where });
    let count = 0;

    for (const commission of commissions) {
      if (commission.status === 'PAID') {
        await db.affiliateCommission.update({
          where: { id: commission.id },
          data: {
            status: 'REVERSED',
            reason: params.reason || 'refund/chargeback',
          },
        });
        await db.affiliateProfile.update({
          where: { id: commission.affiliateId },
          data: {
            totalCommissionEarned: { decrement: Number(commission.commissionAmount) },
          },
        });
      } else {
        await db.affiliateCommission.update({
          where: { id: commission.id },
          data: {
            status: 'REVERSED',
            reason: params.reason || 'refund/chargeback',
          },
        });
        await db.affiliateProfile.update({
          where: { id: commission.affiliateId },
          data: {
            totalCommissionEarned: { decrement: Number(commission.commissionAmount) },
          },
        });
      }
      count++;
    }

    return { success: true, count };
  } catch (error) {
    console.error('Error reversing affiliate commission:', error);
    return { success: false, count: 0 };
  }
}

export async function getCommissionStats(affiliateId: string) {
  const commissions = await db.affiliateCommission.findMany({
    where: { affiliateId },
  });

  const pending = commissions.filter(c => c.status === 'PENDING');
  const approved = commissions.filter(c => c.status === 'APPROVED');
  const payable = commissions.filter(c => c.status === 'PAYABLE');
  const paid = commissions.filter(c => c.status === 'PAID');
  const reversed = commissions.filter(c => c.status === 'REVERSED');

  const sum = (items: any[]) => items.reduce((acc, c) => acc + Number(c.commissionAmount), 0);

  return {
    total: commissions.length,
    pending: { count: pending.length, amount: sum(pending) },
    approved: { count: approved.length, amount: sum(approved) },
    payable: { count: payable.length, amount: sum(payable) },
    paid: { count: paid.length, amount: sum(paid) },
    reversed: { count: reversed.length, amount: sum(reversed) },
    totalEarned: sum(commissions.filter(c => c.status !== 'REVERSED' && c.status !== 'CANCELLED')),
  };
}
