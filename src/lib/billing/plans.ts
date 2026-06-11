export interface PlanFeature {
  key: string
  label: string
  description: string
  group: 'writing' | 'ai' | 'export' | 'publishing' | 'team' | 'marketing' | 'support'
  planRequired: PlanTier
}

export interface PlanLimits {
  maxProjects: number | 'unlimited'
  maxChaptersPerProject: number | 'unlimited'
  aiCreditsMonthly: number | 'unlimited'
  exportsMonthly: number | 'unlimited'
  revisionChecksMonthly: number | 'unlimited'
  fullRevisionChecksMonthly: number | 'unlimited'
  translationWordsMonthly: number | 'unlimited'
  marketingAssetsMonthly: number | 'unlimited'
  maxTeamMembers: number | 'unlimited'
  storagePerProjectMb: number | 'unlimited'
}

export interface PlanConfig {
  id: PlanTier
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  monthlyPriceIdr: number
  yearlyPriceIdr: number
  badge: string
  highlighted: boolean
  limits: PlanLimits
}

export type Currency = 'USD' | 'IDR'

export type PlanTier = 'free' | 'starter' | 'pro' | 'studio'

export const FREE: PlanTier = 'free'
export const STARTER: PlanTier = 'starter'
export const PRO: PlanTier = 'pro'
export const STUDIO: PlanTier = 'studio'

export const PLAN_TIERS: PlanTier[] = ['free', 'starter', 'pro', 'studio']

export const PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying Novelify',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceIdr: 0,
    yearlyPriceIdr: 0,
    badge: 'Free',
    highlighted: false,
    limits: {
      maxProjects: 1,
      maxChaptersPerProject: 10,
      aiCreditsMonthly: 50,
      exportsMonthly: 3,
      revisionChecksMonthly: 5,
      fullRevisionChecksMonthly: 0,
      translationWordsMonthly: 1000,
      marketingAssetsMonthly: 0,
      maxTeamMembers: 1,
      storagePerProjectMb: 50,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For serious writers',
    monthlyPrice: 9,
    yearlyPrice: 90,
    monthlyPriceIdr: 129000,
    yearlyPriceIdr: 1290000,
    badge: 'Starter',
    highlighted: false,
    limits: {
      maxProjects: 5,
      maxChaptersPerProject: 'unlimited',
      aiCreditsMonthly: 500,
      exportsMonthly: 20,
      revisionChecksMonthly: 50,
      fullRevisionChecksMonthly: 1,
      translationWordsMonthly: 10000,
      marketingAssetsMonthly: 5,
      maxTeamMembers: 1,
      storagePerProjectMb: 200,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For published authors',
    monthlyPrice: 19,
    yearlyPrice: 190,
    monthlyPriceIdr: 249000,
    yearlyPriceIdr: 2490000,
    badge: 'Pro',
    highlighted: true,
    limits: {
      maxProjects: 20,
      maxChaptersPerProject: 'unlimited',
      aiCreditsMonthly: 3000,
      exportsMonthly: 100,
      revisionChecksMonthly: 200,
      fullRevisionChecksMonthly: 10,
      translationWordsMonthly: 50000,
      marketingAssetsMonthly: 20,
      maxTeamMembers: 3,
      storagePerProjectMb: 1000,
    },
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    description: 'For professional writers & teams',
    monthlyPrice: 49,
    yearlyPrice: 490,
    monthlyPriceIdr: 649000,
    yearlyPriceIdr: 6490000,
    badge: 'Studio',
    highlighted: false,
    limits: {
      maxProjects: 'unlimited',
      maxChaptersPerProject: 'unlimited',
      aiCreditsMonthly: 'unlimited',
      exportsMonthly: 'unlimited',
      revisionChecksMonthly: 'unlimited',
      fullRevisionChecksMonthly: 'unlimited',
      translationWordsMonthly: 'unlimited',
      marketingAssetsMonthly: 'unlimited',
      maxTeamMembers: 10,
      storagePerProjectMb: 'unlimited',
    },
  },
}

export const FEATURES: PlanFeature[] = [
  // Writing
  { key: 'writing_studio', label: 'Writing Studio', description: 'Full writing studio with chapters & scenes', group: 'writing', planRequired: 'free' },
  { key: 'story_bible', label: 'Story Bible', description: 'Characters, locations, research, timeline', group: 'writing', planRequired: 'free' },
  { key: 'plot_board', label: 'Plot Board', description: 'Visual plot board with beats & acts', group: 'writing', planRequired: 'free' },
  { key: 'writing_goals', label: 'Writing Goals', description: 'Daily/weekly/project writing targets', group: 'writing', planRequired: 'free' },
  { key: 'version_history', label: 'Version History', description: 'Save & restore manuscript versions', group: 'writing', planRequired: 'free' },

  // AI
  { key: 'ai_cowriter', label: 'AI Co-Writer', description: 'AI-assisted writing with scene generation', group: 'ai', planRequired: 'free' },
  { key: 'ai_starter_outline', label: 'AI Starter Outline', description: 'AI-generated story outline to begin', group: 'ai', planRequired: 'free' },
  { key: 'ai_translation', label: 'AI Translation', description: 'Translate your manuscript to other languages', group: 'ai', planRequired: 'free' },
  { key: 'revision_basic', label: 'Revision — Basic', description: 'Check grammar, style, and readability', group: 'ai', planRequired: 'free' },
  { key: 'revision_full_manuscript', label: 'Revision — Full Manuscript', description: 'Deep revision with pacing, plot holes, character arc analysis', group: 'ai', planRequired: 'starter' },
  { key: 'ai_synopsis', label: 'AI Synopsis & Blurb', description: 'Generate professional synopsis and blurbs', group: 'ai', planRequired: 'free' },

  // Export
  { key: 'export_epub', label: 'EPUB Export', description: 'Export to EPUB format', group: 'export', planRequired: 'free' },
  { key: 'export_pdf', label: 'PDF Export', description: 'Export to PDF with professional formatting', group: 'export', planRequired: 'starter' },
  { key: 'export_docx', label: 'DOCX Export', description: 'Export to Microsoft Word format', group: 'export', planRequired: 'pro' },
  { key: 'export_markdown', label: 'Markdown Export', description: 'Export to Markdown format', group: 'export', planRequired: 'free' },

  // Publishing
  { key: 'publishing_center', label: 'Publishing Center', description: 'Metadata, cover, checklist, front/back matter', group: 'publishing', planRequired: 'free' },
  { key: 'publishing_template', label: 'Custom Publishing Templates', description: 'Custom templates for front/back matter', group: 'publishing', planRequired: 'starter' },

  // Team
  { key: 'team_collaboration', label: 'Team Collaboration', description: 'Invite editors, beta readers, co-authors', group: 'team', planRequired: 'studio' },

  // Marketing
  { key: 'marketing_assets', label: 'Marketing Asset Generator', description: 'Generate book descriptions, social posts, ad copy', group: 'marketing', planRequired: 'starter' },
  { key: 'amazon_metadata', label: 'Amazon Metadata Optimization', description: 'Optimize metadata for Amazon KDP', group: 'marketing', planRequired: 'pro' },

  // Support
  { key: 'priority_support', label: 'Priority Support', description: 'Fast email & chat support', group: 'support', planRequired: 'pro' },
  { key: 'api_access', label: 'API Access', description: 'Access Novelify API for integrations', group: 'support', planRequired: 'studio' },
]

export function getPlanConfig(plan: string): PlanConfig {
  return PLANS[plan as PlanTier] || PLANS.free
}

export function hasFeature(plan: string, featureKey: string): boolean {
  const feature = FEATURES.find(f => f.key === featureKey)
  if (!feature) return false
  const planIndex = PLAN_TIERS.indexOf(plan as PlanTier)
  const requiredIndex = PLAN_TIERS.indexOf(feature.planRequired)
  return planIndex >= requiredIndex
}

export function getLimit(plan: string, limitKey: keyof PlanLimits): number | 'unlimited' {
  const config = getPlanConfig(plan)
  return config.limits[limitKey]
}

export function isUnlimited(value: number | 'unlimited'): boolean {
  return value === 'unlimited'
}

export function getFeatureLimit(plan: string, limitKey: keyof PlanLimits): number | null {
  const value = getLimit(plan, limitKey)
  return isUnlimited(value) ? null : (value as number)
}

export function canUseFeature(plan: string, featureKey: string): boolean {
  return hasFeature(plan, featureKey)
}

export function getUpgradeTarget(plan: string, featureKey: string): PlanTier | null {
  if (hasFeature(plan, featureKey)) return null
  const feature = FEATURES.find(f => f.key === featureKey)
  if (!feature) return null
  return feature.planRequired
}

export function getRequiredPlanForFeature(featureKey: string): PlanTier | null {
  const feature = FEATURES.find(f => f.key === featureKey)
  return feature?.planRequired ?? null
}

export function comparePlans(planA: string, planB: string): number {
  return PLAN_TIERS.indexOf(planA as PlanTier) - PLAN_TIERS.indexOf(planB as PlanTier)
}

export function isPlanAtLeast(plan: string, minimum: PlanTier): boolean {
  return comparePlans(plan, minimum) >= 0
}

export function getCurrencyPrice(plan: string, interval: 'monthly' | 'yearly', currency: Currency): number {
  const config = getPlanConfig(plan)
  if (currency === 'IDR') {
    return interval === 'monthly' ? config.monthlyPriceIdr : config.yearlyPriceIdr
  }
  return interval === 'monthly' ? config.monthlyPrice : config.yearlyPrice
}

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'IDR') {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }
  return `$${amount}`
}
