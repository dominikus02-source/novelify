export interface CreateCheckoutParams {
  planId: string
  userId: string
  userEmail: string
  userName?: string
  successUrl: string
  cancelUrl: string
}

export interface BillingPortalParams {
  customerId: string
  returnUrl: string
}

export interface SubscriptionStatus {
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd: boolean
  trialEndsAt?: Date
}

function getStripeSecret(): string {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Payment provider not configured: STRIPE_SECRET_KEY not set')
  }
  return key
}

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<{ url?: string; sessionId?: string; error: string }> {
  return { error: 'Stripe is not configured. Use Lemon Squeezy or Midtrans.' }
}

export async function createBillingPortal(params: BillingPortalParams): Promise<{ url?: string; error: string }> {
  return { error: 'Stripe is not configured. Use Lemon Squeezy or Midtrans.' }
}

export async function handleWebhook(payload: any, signature: string): Promise<{ event?: string; subscriptionId?: string; status?: string; error: string }> {
  return { error: 'Stripe is not configured. Use Lemon Squeezy or Midtrans.' }
}

export async function getSubscriptionStatus(customerId: string): Promise<SubscriptionStatus | { error: string }> {
  return { error: 'Stripe is not configured. Use Lemon Squeezy or Midtrans.' }
}
