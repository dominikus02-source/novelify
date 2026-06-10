import { db } from '../db'
import { getLimit, isUnlimited } from './plans'

export type UsageType =
  | 'ai_credit'
  | 'starter_outline'
  | 'revision_check'
  | 'full_revision_check'
  | 'translation_word'
  | 'export'
  | 'marketing_asset'
  | 'project_created'

export interface UsageSummary {
  periodStart: Date
  periodEnd: Date
  aiCreditsUsed: number
  starterOutlinesUsed: number
  revisionChecksUsed: number
  fullRevisionChecksUsed: number
  translationWordsUsed: number
  exportsUsed: number
  marketingAssetsUsed: number
  projectsCreated: number
}

const USAGE_TYPE_COLUMN: Record<UsageType, keyof UsageSummary> = {
  ai_credit: 'aiCreditsUsed',
  starter_outline: 'starterOutlinesUsed',
  revision_check: 'revisionChecksUsed',
  full_revision_check: 'fullRevisionChecksUsed',
  translation_word: 'translationWordsUsed',
  export: 'exportsUsed',
  marketing_asset: 'marketingAssetsUsed',
  project_created: 'projectsCreated',
}

const USAGE_LIMIT_KEY: Record<UsageType, string> = {
  ai_credit: 'aiCreditsMonthly',
  starter_outline: 'aiCreditsMonthly',
  revision_check: 'revisionChecksMonthly',
  full_revision_check: 'fullRevisionChecksMonthly',
  translation_word: 'translationWordsMonthly',
  export: 'exportsMonthly',
  marketing_asset: 'marketingAssetsMonthly',
  project_created: 'maxProjects',
}

export async function getOrCreateCurrentUsagePeriod(userId: string) {
  const now = new Date()
  const periodStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
  const periodEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1))

  let period = await db.usageTracking.findFirst({
    where: {
      userId,
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd },
    },
  })

  if (!period) {
    period = await db.usageTracking.create({
      data: {
        userId,
        periodStart,
        periodEnd,
      },
    })
  }

  return period
}

export async function trackUsage(
  userId: string,
  userPlan: string,
  type: UsageType,
  amount: number = 1,
): Promise<{ success: boolean; remaining: number | 'unlimited'; limit: number | 'unlimited' }> {
  const limitKey = USAGE_LIMIT_KEY[type]
  const limit = getLimit(userPlan, limitKey as any)

  if (isUnlimited(limit)) {
    return { success: true, remaining: 'unlimited', limit: 'unlimited' }
  }

  const period = await getOrCreateCurrentUsagePeriod(userId)
  const column = USAGE_TYPE_COLUMN[type]
  const current = Number(period[column]) || 0
  const numericLimit = limit as number
  const remaining = numericLimit - current

  if (remaining <= 0) {
    return { success: false, remaining: 0, limit }
  }

  if (amount > remaining) {
    return { success: false, remaining, limit }
  }

  await db.usageTracking.update({
    where: { id: period.id },
    data: { [column]: { increment: amount } },
  })

  await db.usageEvent.create({
    data: {
      userId,
      type,
      amount,
    },
  })

  return { success: true, remaining: remaining - amount, limit }
}

export async function checkUsageLimit(
  userId: string,
  userPlan: string,
  type: UsageType,
  amount: number = 1,
): Promise<{ allowed: boolean; remaining: number | 'unlimited'; limit: number | 'unlimited' }> {
  const limitKey = USAGE_LIMIT_KEY[type]
  const limit = getLimit(userPlan, limitKey as any)

  if (isUnlimited(limit)) {
    return { allowed: true, remaining: 'unlimited', limit: 'unlimited' }
  }

  const period = await getOrCreateCurrentUsagePeriod(userId)
  const column = USAGE_TYPE_COLUMN[type]
  const current = Number(period[column]) || 0
  const numericLimit = limit as number
  const remaining = numericLimit - current

  return {
    allowed: remaining >= amount,
    remaining: Math.max(0, remaining),
    limit,
  }
}

export async function getCurrentUsage(userId: string): Promise<UsageSummary> {
  const period = await getOrCreateCurrentUsagePeriod(userId)
  return {
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    aiCreditsUsed: period.aiCreditsUsed,
    starterOutlinesUsed: period.starterOutlinesUsed,
    revisionChecksUsed: period.revisionChecksUsed,
    fullRevisionChecksUsed: period.fullRevisionChecksUsed,
    translationWordsUsed: period.translationWordsUsed,
    exportsUsed: period.exportsUsed,
    marketingAssetsUsed: period.marketingAssetsUsed,
    projectsCreated: period.projectsCreated,
  }
}

export async function getUsageSummary(userId: string) {
  const usage = await getCurrentUsage(userId)
  return {
    usage,
    aiCreditsRemaining: usage.aiCreditsUsed,
    exportsRemaining: usage.exportsUsed,
    translationWordsRemaining: usage.translationWordsUsed,
  }
}

export async function resetUsagePeriodIfNeeded(userId: string) {
  const now = new Date()
  const periodStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
  const periodEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1))

  const existing = await db.usageTracking.findFirst({
    where: {
      userId,
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd },
    },
  })

  if (!existing) {
    await db.usageTracking.create({
      data: { userId, periodStart, periodEnd },
    })
  }
}
