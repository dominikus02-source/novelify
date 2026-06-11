import { NextRequest, NextResponse } from 'next/server'
import { handleWebhook } from '@/lib/billing/providers/midtrans'
import { db } from '@/lib/db'
import { PLAN_TIERS } from '@/lib/billing/plans'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const result = await handleWebhook(payload)

    const orderId = result.orderId
    if (!orderId) {
      return NextResponse.json({ status: 'ok', event: result.event })
    }

    const parts = orderId.split('-')
    const userId = parts[1]

    if (!userId) {
      return NextResponse.json({ status: 'ok', event: result.event })
    }

    const existingSubscription = await db.subscription.findFirst({
      where: { providerSubscriptionId: orderId },
    })

    if (existingSubscription) {
      return NextResponse.json({ status: 'ok', event: result.event, note: 'already processed' })
    }

    const subscriptionStatusToSave = result.status === 'active' ? 'active'
      : result.status === 'pending_review' ? 'past_due'
      : result.status === 'pending' ? 'pending'
      : result.status === 'canceled' ? 'canceled'
      : result.status === 'refunded' ? 'expired'
      : 'free'

    const planFromPayload = payload.item_details?.[0]?.id
    const plan = planFromPayload && PLAN_TIERS.includes(planFromPayload)
      ? planFromPayload
      : 'pro'

    if (result.event === 'payment.success') {
      await db.user.update({
        where: { id: userId },
        data: {
          plan,
          subscriptionStatus: result.status === 'active' ? 'active' : 'past_due',
        },
      })

      await db.subscription.upsert({
        where: { userId },
        update: {
          plan,
          status: result.status === 'active' ? 'active' : 'past_due',
          provider: 'midtrans',
          providerSubscriptionId: orderId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        create: {
          userId,
          plan,
          status: result.status === 'active' ? 'active' : 'past_due',
          provider: 'midtrans',
          providerCustomerId: payload.transaction_id,
          providerSubscriptionId: orderId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }

    if (result.event === 'payment.failed' || result.event === 'payment.refund') {
      const currentSub = await db.subscription.findUnique({ where: { userId } })
      if (currentSub?.status === 'active' || currentSub?.status === 'past_due') {
        await db.subscription.update({
          where: { userId },
          data: { status: subscriptionStatusToSave },
        })
        await db.user.update({
          where: { id: userId },
          data: { subscriptionStatus: subscriptionStatusToSave },
        })
      }
    }

    await db.billingEvent.create({
      data: {
        userId,
        provider: 'midtrans',
        type: result.event === 'payment.success' ? 'subscription_payment_success'
          : result.event === 'payment.failed' ? 'subscription_payment_failed'
          : result.event === 'payment.pending' ? 'checkout_created'
          : result.event === 'payment.refund' ? 'subscription_payment_failed'
          : 'unknown',
        rawType: result.transactionStatus,
        status: subscriptionStatusToSave,
        plan,
        amount: payload.gross_amount,
        currency: 'IDR',
        metadataJson: JSON.stringify({
          orderId,
          transactionStatus: result.transactionStatus,
          fraudStatus: result.fraudStatus,
          transaction_id: payload.transaction_id,
        }),
      },
    })

    return NextResponse.json({ status: 'ok', event: result.event })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
