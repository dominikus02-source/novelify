import { NextRequest, NextResponse } from 'next/server'
import { handleWebhook } from '@/lib/billing/providers/midtrans'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const result = await handleWebhook(payload)

    if (result.event === 'payment.success' && result.orderId) {
      const parts = result.orderId.split('-')
      const userId = parts[1]

      if (userId) {
        const user = await db.user.findUnique({ where: { id: userId } })
        if (user) {
          const plan = user.plan === 'pro' ? 'pro' : user.plan === 'starter' ? 'starter' : 'studio'

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
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            create: {
              userId,
              plan,
              status: result.status === 'active' ? 'active' : 'past_due',
              provider: 'midtrans',
              providerCustomerId: payload.transaction_id,
              providerSubscriptionId: result.orderId,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          })
        }
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
