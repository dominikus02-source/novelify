import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getPlanConfig, PLANS } from '@/lib/billing/plans'
import { createCheckoutSession } from '@/lib/billing/providers/midtrans'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan: planId } = body

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planConfig = getPlanConfig(planId)

    if (planConfig.monthlyPrice === 0) {
      await db.user.update({
        where: { id: session.user.id },
        data: { plan: planId },
      })
      await db.subscription.upsert({
        where: { userId: session.user.id },
        update: { plan: planId, status: 'active', provider: 'manual' },
        create: { userId: session.user.id, plan: planId, status: 'active', provider: 'manual' },
      })
      return NextResponse.json({ success: true, plan: planId, message: 'Free plan activated' })
    }

    try {
      const result = await createCheckoutSession({
        planId,
        planName: planConfig.name,
        planPrice: planConfig.monthlyPrice * 1000,
        userId: session.user.id,
        userEmail: session.user.email || '',
        userName: session.user.name || undefined,
        successUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings?tab=billing&success=true`,
        cancelUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      })

      return NextResponse.json({
        success: true,
        redirectUrl: result.redirect_url,
        token: result.token,
      })
    } catch (providerError) {
      const message = providerError instanceof Error ? providerError.message : ''
      return NextResponse.json({
        error: message.includes('not configured')
          ? 'Online billing not configured yet. Set up MIDTRANS_SERVER_KEY or STRIPE_SECRET_KEY to enable.'
          : `Payment failed: ${message}`,
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
