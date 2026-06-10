import { db } from '@/lib/db'

export type LemonSqueezyPlan = 'starter' | 'pro' | 'studio'
export type LemonSqueezyInterval = 'monthly' | 'yearly'

export interface LemonSqueezyCheckoutParams {
  userId: string
  userEmail: string
  userName?: string
  plan: LemonSqueezyPlan
  interval: LemonSqueezyInterval
}

export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string
    custom_data?: {
      userId?: string
      plan?: string
      interval?: string
      app?: string
    }
    test_mode?: boolean
  }
  data: {
    id: string
    type: string
    attributes: Record<string, unknown>
  }
}

export interface LemonSqueezySubscriptionAttributes {
  order_id?: number
  order_item_id?: number
  product_id?: number
  variant_id?: number
  variant_name?: string
  customer_id?: number
  user_name?: string
  user_email?: string
  status?: string
  status_formatted?: string
  card_brand?: string
  card_last_four?: string
  currency?: string
  currency_rate?: string
  totals?: {
    subtotal?: number
    discount?: number
    tax?: number
    total?: number
  }
  first_subscription_item?: {
    id?: number
    subscription_id?: number
    price_id?: number
    quantity?: number
    is_usage_based?: boolean
    created_at?: string
    updated_at?: string
  }
  urls?: {
    update_payment_method?: string
    customer_portal?: string
  }
  created_at?: string
  updated_at?: string
  cancelled_at?: string | null
  trial_ends_at?: string | null
  billing_anchor?: number
  store_id?: number
  product_name?: string
  renews_at?: string | null
  ends_at?: string | null
  is_scheduled_to_cancel?: boolean
}

const VARIANT_ENV_KEYS: Record<LemonSqueezyPlan, Record<LemonSqueezyInterval, string>> = {
  starter: {
    monthly: 'LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID',
    yearly: 'LEMONSQUEEZY_STARTER_YEARLY_VARIANT_ID',
  },
  pro: {
    monthly: 'LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID',
    yearly: 'LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID',
  },
  studio: {
    monthly: 'LEMONSQUEEZY_STUDIO_MONTHLY_VARIANT_ID',
    yearly: 'LEMONSQUEEZY_STUDIO_YEARLY_VARIANT_ID',
  },
}

export function getLemonSqueezyConfig() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return { apiKey, storeId, webhookSecret, appUrl }
}

export function isLemonSqueezyConfigured(): boolean {
  const { apiKey, storeId, webhookSecret } = getLemonSqueezyConfig()
  return !!(apiKey && storeId && webhookSecret)
}

export function getLemonSqueezyVariantId(plan: LemonSqueezyPlan, interval: LemonSqueezyInterval): string | null {
  const envKey = VARIANT_ENV_KEYS[plan]?.[interval]
  if (!envKey) return null
  return process.env[envKey] || null
}

export function getPlanFromLemonSqueezyVariantId(variantId: string | number): { plan: LemonSqueezyPlan; interval: LemonSqueezyInterval } | null {
  const variantIdStr = String(variantId)
  for (const [plan, intervals] of Object.entries(VARIANT_ENV_KEYS)) {
    for (const [interval, envKey] of Object.entries(intervals)) {
      if (process.env[envKey] === variantIdStr) {
        return { plan: plan as LemonSqueezyPlan, interval: interval as LemonSqueezyInterval }
      }
    }
  }
  return null
}

export function mapLemonSqueezyStatusToSubscriptionStatus(lsStatus: string): string {
  const statusMap: Record<string, string> = {
    active: 'active',
    cancelled: 'canceled',
    canceled: 'canceled',
    expired: 'expired',
    past_due: 'past_due',
    paused: 'paused',
    on_trial: 'trialing',
    trialing: 'trialing',
    free: 'free',
    unpaid: 'past_due',
  }
  return statusMap[lsStatus?.toLowerCase()] || lsStatus || 'free'
}

export async function createLemonSqueezyCheckout(params: LemonSqueezyCheckoutParams): Promise<{ checkoutUrl: string; checkoutId: string }> {
  const { apiKey, storeId, appUrl } = getLemonSqueezyConfig()

  if (!apiKey || !storeId) {
    throw new Error('Payment provider is not configured')
  }

  const variantId = getLemonSqueezyVariantId(params.plan, params.interval)
  if (!variantId) {
    throw new Error(`Payment provider is not configured: variant ID for ${params.plan} ${params.interval} not set`)
  }

  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            custom: {
              userId: params.userId,
              plan: params.plan,
              interval: params.interval,
              app: 'novelify',
            },
          },
          product_options: {
            enabled_variants: [Number(variantId)],
            redirect_url: `${appUrl}/dashboard/settings?billing=success`,
            cancel_url: `${appUrl}/pricing?checkout=cancelled`,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: String(storeId),
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: String(variantId),
            },
          },
        },
      },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to create checkout: ${response.status}`)
  }

  const result = await response.json()
  const checkoutUrl = result?.data?.attributes?.url
  const checkoutId = result?.data?.id

  if (!checkoutUrl) {
    throw new Error('Failed to create checkout: no checkout URL returned')
  }

  return { checkoutUrl, checkoutId: String(checkoutId) }
}

export function verifyLemonSqueezyWebhook(rawBody: string, signature: string): boolean {
  const { webhookSecret } = getLemonSqueezyConfig()
  if (!webhookSecret) return false

  const crypto = require('crypto')
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')

  try {
    const received = signature
      .split(',')
      .find((part: string) => part.startsWith('sig_'))
      ?.split('=')[1]
      ?.trim()

    if (!received) return false

    if (crypto.timingSafeEqual) {
      const expectedBuf = Buffer.from(expected)
      const receivedBuf = Buffer.from(received)
      if (expectedBuf.length !== receivedBuf.length) return false
      return crypto.timingSafeEqual(expectedBuf, receivedBuf)
    }

    return expected === received
  } catch {
    return false
  }
}

export function parseLemonSqueezyEventName(payload: LemonSqueezyWebhookPayload): string {
  return payload?.meta?.event_name || 'unknown'
}

export function extractCustomData(payload: LemonSqueezyWebhookPayload): { userId?: string; plan?: string; interval?: string } {
  return payload?.meta?.custom_data || {}
}

export async function handleSubscriptionCreated(payload: LemonSqueezyWebhookPayload): Promise<{ userId: string | null; plan: string; status: string }> {
  const customData = extractCustomData(payload)
  const attributes = payload?.data?.attributes || {}
  const variantId = attributes.variant_id || (attributes as any).variant_id
  const subscriptionId = payload?.data?.id
  const customerId = attributes.customer_id
  const status = mapLemonSqueezyStatusToSubscriptionStatus(String(attributes.status || 'active'))
  const currentPeriodEnd = attributes.renews_at || attributes.ends_at
  const trialEndsAt = attributes.trial_ends_at

  let userId = customData.userId || null
  let plan = customData.plan || ''

  if (!plan && variantId) {
    const mapping = getPlanFromLemonSqueezyVariantId(variantId)
    if (mapping) plan = mapping.plan
  }

  if (!userId && subscriptionId) {
    const existing = await db.subscription.findFirst({
      where: { providerSubscriptionId: String(subscriptionId) },
      select: { userId: true },
    })
    if (existing) userId = existing.userId
  }

  if (userId && plan) {
    await db.user.update({
      where: { id: userId },
      data: { plan, subscriptionStatus: status },
    })

    await db.subscription.upsert({
      where: { userId },
      update: {
        plan,
        status,
        provider: 'lemonsqueezy',
        providerCustomerId: customerId ? String(customerId) : undefined,
        providerSubscriptionId: subscriptionId ? String(subscriptionId) : undefined,
        providerVariantId: variantId ? String(variantId) : undefined,
        currentPeriodStart: attributes.created_at ? new Date(attributes.created_at as string) : undefined,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd as string) : undefined,
        cancelAtPeriodEnd: (attributes as any).is_scheduled_to_cancel || false,
        trialEndsAt: trialEndsAt ? new Date(trialEndsAt as string) : undefined,
      },
      create: {
        userId,
        plan,
        status,
        provider: 'lemonsqueezy',
        providerCustomerId: customerId ? String(customerId) : undefined,
        providerSubscriptionId: subscriptionId ? String(subscriptionId) : undefined,
        providerVariantId: variantId ? String(variantId) : undefined,
        currentPeriodStart: attributes.created_at ? new Date(attributes.created_at as string) : undefined,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd as string) : undefined,
        cancelAtPeriodEnd: (attributes as any).is_scheduled_to_cancel || false,
        trialEndsAt: trialEndsAt ? new Date(trialEndsAt as string) : undefined,
      },
    })
  }

  return { userId, plan, status }
}

export async function handleSubscriptionUpdated(payload: LemonSqueezyWebhookPayload): Promise<{ userId: string | null; plan: string; status: string }> {
  return handleSubscriptionCreated(payload)
}

export async function handleSubscriptionCancelled(payload: LemonSqueezyWebhookPayload): Promise<{ userId: string | null; plan: string; status: string }> {
  const attributes = payload?.data?.attributes || {}
  const subscriptionId = payload?.data?.id
  const isScheduledToCancel = (attributes as any).is_scheduled_to_cancel
  const endsAt = attributes.ends_at

  let userId: string | null = null
  let subscription

  if (subscriptionId) {
    subscription = await db.subscription.findFirst({
      where: { providerSubscriptionId: String(subscriptionId) },
    })
    if (subscription) userId = subscription.userId
  }

  if (!userId) {
    const customData = extractCustomData(payload)
    userId = customData.userId || null
  }

  if (userId) {
    if (isScheduledToCancel && endsAt) {
      await db.subscription.update({
        where: { userId },
        data: { cancelAtPeriodEnd: true },
      })
    } else {
      const status = mapLemonSqueezyStatusToSubscriptionStatus(String(attributes.status || 'cancelled'))
      await db.subscription.update({
        where: { userId },
        data: { status },
      })
      if (status === 'canceled' || status === 'expired') {
        await db.user.update({
          where: { id: userId },
          data: { plan: 'free', subscriptionStatus: status },
        })
      }
    }
  }

  return { userId, plan: 'free', status: 'canceled' }
}

export async function handleSubscriptionExpired(payload: LemonSqueezyWebhookPayload): Promise<{ userId: string | null; plan: string; status: string }> {
  const subscriptionId = payload?.data?.id
  let userId: string | null = null

  if (subscriptionId) {
    const sub = await db.subscription.findFirst({
      where: { providerSubscriptionId: String(subscriptionId) },
    })
    if (sub) userId = sub.userId
  }

  if (userId) {
    await db.user.update({
      where: { id: userId },
      data: { plan: 'free', subscriptionStatus: 'expired' },
    })
    await db.subscription.update({
      where: { userId },
      data: { status: 'expired', plan: 'free' },
    })
  }

  return { userId, plan: 'free', status: 'expired' }
}

export async function handleSubscriptionPaymentSuccess(payload: LemonSqueezyWebhookPayload): Promise<{ userId: string | null; plan: string; status: string }> {
  const subscriptionId = payload?.data?.id
  const attributes = payload?.data?.attributes || {}
  const currentPeriodEnd = attributes.renews_at || attributes.ends_at

  let userId: string | null = null
  if (subscriptionId) {
    const sub = await db.subscription.findFirst({
      where: { providerSubscriptionId: String(subscriptionId) },
    })
    if (sub) userId = sub.userId
  }

  if (userId) {
    const updateData: Record<string, unknown> = { status: 'active' }
    if (currentPeriodEnd) updateData.currentPeriodEnd = new Date(currentPeriodEnd as string)
    await db.subscription.update({ where: { userId }, data: updateData as any })
    await db.user.update({ where: { id: userId }, data: { subscriptionStatus: 'active' } })
  }

  return { userId, plan: '', status: 'active' }
}

export async function handleSubscriptionPaymentFailed(payload: LemonSqueezyWebhookPayload): Promise<{ userId: string | null; plan: string; status: string }> {
  const subscriptionId = payload?.data?.id
  let userId: string | null = null

  if (subscriptionId) {
    const sub = await db.subscription.findFirst({
      where: { providerSubscriptionId: String(subscriptionId) },
    })
    if (sub) userId = sub.userId
  }

  if (userId) {
    await db.subscription.update({
      where: { userId },
      data: { status: 'past_due' },
    })
    await db.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'past_due' },
    })
  }

  return { userId, plan: '', status: 'past_due' }
}

export async function handleSubscriptionResumed(payload: LemonSqueezyWebhookPayload): Promise<{ userId: string | null; plan: string; status: string }> {
  const subscriptionId = payload?.data?.id
  let userId: string | null = null

  if (subscriptionId) {
    const sub = await db.subscription.findFirst({
      where: { providerSubscriptionId: String(subscriptionId) },
    })
    if (sub) userId = sub.userId
  }

  if (userId) {
    await db.subscription.update({
      where: { userId },
      data: { status: 'active', cancelAtPeriodEnd: false },
    })
    await db.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'active' },
    })
  }

  return { userId, plan: '', status: 'active' }
}

export async function handleSubscriptionPaused(payload: LemonSqueezyWebhookPayload): Promise<{ userId: string | null; plan: string; status: string }> {
  const subscriptionId = payload?.data?.id
  let userId: string | null = null

  if (subscriptionId) {
    const sub = await db.subscription.findFirst({
      where: { providerSubscriptionId: String(subscriptionId) },
    })
    if (sub) userId = sub.userId
  }

  if (userId) {
    await db.subscription.update({
      where: { userId },
      data: { status: 'paused' },
    })
    await db.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'paused' },
    })
  }

  return { userId, plan: '', status: 'paused' }
}

export async function handleOrderCreated(payload: LemonSqueezyWebhookPayload): Promise<{ userId: string | null; plan: string; status: string }> {
  const customData = extractCustomData(payload)
  return { userId: customData.userId || null, plan: customData.plan || '', status: 'active' }
}

export async function saveBillingEvent(
  provider: string,
  userId: string | null,
  type: string,
  rawType: string,
  status: string | null,
  plan: string | null,
  providerEventId: string | null,
  metadata: Record<string, unknown> | null,
) {
  try {
    await db.billingEvent.create({
      data: {
        userId,
        provider,
        type,
        rawType,
        status,
        plan,
        providerEventId,
        metadataJson: metadata ? JSON.stringify(metadata) : null,
      },
    })
  } catch (error) {
    if (providerEventId) {
      const existing = await db.billingEvent.findUnique({
        where: { providerEventId },
        select: { id: true },
      })
      if (existing) return
    }
    console.error('Failed to save billing event:', error)
  }
}

export async function processLemonSqueezyWebhook(rawBody: string, signature: string): Promise<{ success: boolean; event: string; userId: string | null; plan: string; status: string }> {
  const isValid = verifyLemonSqueezyWebhook(rawBody, signature)
  if (!isValid) {
    return { success: false, event: 'invalid_signature', userId: null, plan: '', status: '' }
  }

  const payload: LemonSqueezyWebhookPayload = JSON.parse(rawBody)
  const eventName = parseLemonSqueezyEventName(payload)
  const providerEventId = payload?.data?.id
  const testMode = payload?.meta?.test_mode

  let result = { userId: null as string | null, plan: '', status: '' }

  try {
    switch (eventName) {
      case 'subscription_created':
        result = await handleSubscriptionCreated(payload)
        break
      case 'subscription_updated':
        result = await handleSubscriptionUpdated(payload)
        break
      case 'subscription_cancelled':
        result = await handleSubscriptionCancelled(payload)
        break
      case 'subscription_resumed':
        result = await handleSubscriptionResumed(payload)
        break
      case 'subscription_expired':
        result = await handleSubscriptionExpired(payload)
        break
      case 'subscription_paused':
        result = await handleSubscriptionPaused(payload)
        break
      case 'subscription_unpaused':
        result = await handleSubscriptionResumed(payload)
        break
      case 'subscription_payment_success':
        result = await handleSubscriptionPaymentSuccess(payload)
        break
      case 'subscription_payment_failed':
        result = await handleSubscriptionPaymentFailed(payload)
        break
      case 'subscription_payment_recovered':
        result = await handleSubscriptionResumed(payload)
        break
      case 'order_created':
        result = await handleOrderCreated(payload)
        break
      default:
        break
    }

    await saveBillingEvent(
      'lemonsqueezy',
      result.userId,
      eventName,
      eventName,
      result.status || null,
      result.plan || null,
      providerEventId ? `ls-${providerEventId}` : null,
      { testMode, eventName, plan: result.plan },
    )

    return { success: true, event: eventName, userId: result.userId, plan: result.plan, status: result.status }
  } catch (error) {
    console.error(`Error processing webhook event ${eventName}:`, error)
    await saveBillingEvent(
      'lemonsqueezy',
      null,
      'error',
      eventName,
      null,
      null,
      providerEventId ? `ls-error-${providerEventId}` : null,
      { error: String(error), eventName },
    )
    return { success: false, event: eventName, userId: null, plan: '', status: '' }
  }
}
