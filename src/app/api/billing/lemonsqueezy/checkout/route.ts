import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { isLemonSqueezyConfigured, createLemonSqueezyCheckout, saveBillingEvent } from '@/lib/billing/providers/lemonsqueezy'
import { getPlanConfig, PLAN_TIERS } from '@/lib/billing/plans'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isLemonSqueezyConfigured()) {
      return NextResponse.json({
        error: 'PAYMENT_NOT_CONFIGURED',
        message: 'Payment provider is not configured. Please contact support.',
      }, { status: 400 })
    }

    const body = await request.json()
    const { plan, interval } = body

    if (!plan || !interval) {
      return NextResponse.json({ error: 'plan and interval are required' }, { status: 400 })
    }

    const planLower = plan.toLowerCase()
    const intervalLower = interval.toLowerCase()

    const validPlans = ['starter', 'pro', 'studio']
    const validIntervals = ['monthly', 'yearly']

    if (!validPlans.includes(planLower)) {
      return NextResponse.json({ error: `Invalid plan. Must be one of: ${validPlans.join(', ')}` }, { status: 400 })
    }
    if (!validIntervals.includes(intervalLower)) {
      return NextResponse.json({ error: `Invalid interval. Must be one of: ${validIntervals.join(', ')}` }, { status: 400 })
    }

    const planConfig = getPlanConfig(planLower)
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const referral = await db.affiliateReferral.findUnique({
      where: { referredUserId: session.user.id },
      include: { affiliate: true },
    })

    const checkoutParams: Parameters<typeof createLemonSqueezyCheckout>[0] = {
      userId: session.user.id,
      userEmail: session.user.email || '',
      userName: session.user.name || undefined,
      plan: planLower as 'starter' | 'pro' | 'studio',
      interval: intervalLower as 'monthly' | 'yearly',
    }

    if (referral?.affiliate.status === 'ACTIVE') {
      checkoutParams.affiliateId = referral.affiliate.id
      checkoutParams.referralId = referral.id
      checkoutParams.referralCode = referral.affiliate.code
    }

    const result = await createLemonSqueezyCheckout(checkoutParams)

    await saveBillingEvent(
      'lemonsqueezy',
      session.user.id,
      'checkout_created',
      'checkout_created',
      'pending',
      planLower,
      null,
      { checkoutId: result.checkoutId, plan: planLower, interval: intervalLower },
    )

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      checkoutId: result.checkoutId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout'
    if (message.includes('not configured') || message.includes('not set')) {
      return NextResponse.json({
        error: 'PAYMENT_NOT_CONFIGURED',
        message: 'Payment provider is not configured. Please contact support.',
      }, { status: 400 })
    }
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
