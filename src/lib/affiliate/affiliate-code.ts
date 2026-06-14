import { db } from '@/lib/db';

const CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

function randomSuffix(length = 3): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

export function normalizeAffiliateCode(code: string): string {
  return code.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
}

export function generateAffiliateCode(name?: string | null, email?: string | null): string {
  const prefix = name
    ? name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
    : email
      ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
      : 'user';
  const suffix = randomSuffix(3);
  return `${prefix}-${suffix}`;
}

export async function isAffiliateCodeAvailable(code: string): Promise<boolean> {
  const normalized = normalizeAffiliateCode(code);
  if (!normalized || normalized.length < 4) return false;
  const existing = await db.affiliateProfile.findUnique({ where: { code: normalized } });
  return !existing;
}

export async function createAffiliateProfileForUser(
  userId: string,
  options?: { code?: string; tier?: 'STANDARD' | 'TOP_PARTNER' | 'CUSTOM'; commissionRate?: number }
): Promise<{ profile: any; code: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, affiliateProfile: true },
  });

  if (!user) throw new Error('User not found');
  if (user.affiliateProfile) throw new Error('Affiliate profile already exists');

  let code = options?.code ? normalizeAffiliateCode(options.code) : generateAffiliateCode(user.name, user.email);

  if (!code || code.length < 4) {
    code = generateAffiliateCode(user.name, user.email);
  }

  let available = await isAffiliateCodeAvailable(code);
  let attempts = 0;
  while (!available && attempts < 10) {
    code = generateAffiliateCode(user.name, user.email);
    available = await isAffiliateCodeAvailable(code);
    attempts++;
  }
  if (!available) {
    code = `user-${randomSuffix(4)}`;
    while (!(await isAffiliateCodeAvailable(code))) {
      code = `user-${randomSuffix(4)}`;
    }
  }

  const profile = await db.affiliateProfile.create({
    data: {
      userId,
      code,
      status: 'PENDING',
      tier: options?.tier || 'STANDARD',
      commissionRate: options?.commissionRate ?? 0.30,
    },
  });

  return { profile, code };
}

export async function getOrCreateAffiliateProfile(userId: string) {
  let profile = await db.affiliateProfile.findUnique({ where: { userId } });
  if (!profile) {
    const result = await createAffiliateProfileForUser(userId);
    profile = result.profile;
  }
  return profile;
}

async function getAffiliateSettings() {
  const settings = await db.affiliateSettings.findFirst();
  return settings || {
    standardCommissionRate: 0.30,
    topPartnerCommissionRate: 0.35,
    commissionDurationMonths: 12,
    cookieDurationDays: 60,
    minimumPayoutAmount: 50,
    commissionHoldingDays: 14,
    payoutCurrency: 'USD',
  };
}

export { getAffiliateSettings };
export { randomSuffix };

export async function getEffectiveCommissionRate(profile: { tier: string; commissionRate: any }): Promise<number> {
  if (profile.tier === 'CUSTOM') return Number(profile.commissionRate);
  if (profile.tier === 'TOP_PARTNER') {
    const settings = await getAffiliateSettings();
    return Number(settings.topPartnerCommissionRate);
  }
  return Number(profile.commissionRate);
}
