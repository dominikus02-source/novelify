import { hasFeature, getUpgradeTarget, getPlanConfig, PLAN_TIERS, type PlanTier, FEATURES } from './plans'
import { checkUsageLimit, type UsageType } from './usage'

export class FeatureGateError extends Error {
  public featureKey: string
  public currentPlan: string
  public requiredPlan: string
  public upgradeCta: string

  constructor(featureKey: string, currentPlan: string, requiredPlan: string, message?: string) {
    super(message || `Feature "${featureKey}" requires ${requiredPlan} plan. Current plan: ${currentPlan}`)
    this.name = 'FeatureGateError'
    this.featureKey = featureKey
    this.currentPlan = currentPlan
    this.requiredPlan = requiredPlan
    this.upgradeCta = buildUpgradeCta(currentPlan, requiredPlan)
  }

  toJSON() {
    return {
      error: 'FEATURE_LIMIT_REACHED',
      featureKey: this.featureKey,
      currentPlan: this.currentPlan,
      requiredPlan: this.requiredPlan,
      message: this.message,
      upgradeCta: this.upgradeCta,
    }
  }
}

export class UsageLimitError extends Error {
  public featureKey: string
  public currentPlan: string
  public requiredPlan: string | null
  public remaining: number | 'unlimited'
  public limit: number | 'unlimited'
  public upgradeCta: string | null

  constructor(
    featureKey: string,
    currentPlan: string,
    remaining: number | 'unlimited',
    limit: number | 'unlimited',
    requiredPlan?: string,
  ) {
    super(`Usage limit reached for "${featureKey}". Limit: ${limit}`)
    this.name = 'UsageLimitError'
    this.featureKey = featureKey
    this.currentPlan = currentPlan
    this.requiredPlan = requiredPlan || null
    this.remaining = remaining
    this.limit = limit
    this.upgradeCta = requiredPlan ? buildUpgradeCta(currentPlan, requiredPlan) : null
  }

  toJSON() {
    return {
      error: 'USAGE_LIMIT_REACHED',
      featureKey: this.featureKey,
      currentPlan: this.currentPlan,
      requiredPlan: this.requiredPlan,
      message: this.message,
      upgradeCta: this.upgradeCta,
      remaining: this.remaining,
      limit: this.limit,
    }
  }
}

function buildUpgradeCta(currentPlan: string, requiredPlan: string): string {
  const currentIdx = PLAN_TIERS.indexOf(currentPlan as PlanTier)
  const requiredIdx = PLAN_TIERS.indexOf(requiredPlan as PlanTier)
  const planName = getPlanConfig(requiredPlan).name
  const price = getPlanConfig(requiredPlan).monthlyPrice

  if (requiredIdx > currentIdx + 1) {
    const midPlan = PLAN_TIERS[requiredIdx - 1]
    const midName = getPlanConfig(midPlan).name
    return `Upgrade to ${planName} ($${price}/mo). Consider ${midName} first.`
  }

  return `Upgrade to ${planName} for $${price}/mo to unlock this feature.`
}

export async function requireFeature(userId: string, userPlan: string, featureKey: string): Promise<void> {
  if (!hasFeature(userPlan, featureKey)) {
    const feature = FEATURES.find(f => f.key === featureKey)
    const requiredPlan = feature?.planRequired || 'pro'
    throw new FeatureGateError(featureKey, userPlan, requiredPlan)
  }
}

export async function requireUsageLimit(
  userId: string,
  userPlan: string,
  type: UsageType,
  amount: number = 1,
  featureKey?: string,
): Promise<void> {
  const result = await checkUsageLimit(userId, userPlan, type, amount)
  if (!result.allowed) {
    const feature = featureKey || type
    const upgradeTarget = getUpgradeTarget(userPlan, feature)
    const requiredPlan = upgradeTarget ? getPlanConfig(upgradeTarget).id : undefined
    throw new UsageLimitError(feature, userPlan, result.remaining, result.limit, requiredPlan)
  }
}

export function buildUpgradePayload(currentPlan: string, targetPlan: PlanTier, featureKey: string) {
  const current = getPlanConfig(currentPlan)
  const target = getPlanConfig(targetPlan)
  const feature = FEATURES.find(f => f.key === featureKey)

  return {
    currentPlan: current.name,
    targetPlan: target.name,
    targetPlanId: target.id,
    targetPrice: target.monthlyPrice,
    featureName: feature?.label || featureKey,
    featureDescription: feature?.description || '',
    benefit: `Upgrade from ${current.name} to ${target.name} to access ${feature?.label || featureKey}`,
    priceDifference: target.monthlyPrice - current.monthlyPrice,
  }
}

export function recordFeatureGateEvent(featureKey: string, userId: string, plan: string) {

}
