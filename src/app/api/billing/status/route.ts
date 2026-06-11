import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUsage } from '@/lib/billing/usage'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, plan: true, subscriptionStatus: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: user.id },
      select: {
        status: true,
        provider: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        plan: true,
      },
    })

    const usage = await getCurrentUsage(user.id)

    const latestEvent = await db.billingEvent.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { type: true, createdAt: true, status: true },
    })

    return NextResponse.json({
      plan: subscription?.plan || user.plan,
      subscriptionStatus: subscription?.status || user.subscriptionStatus,
      provider: subscription?.provider || null,
      currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() || null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
      usage,
      latestBillingEvent: latestEvent || null,
    })
  } catch (error) {
    console.error('Error fetching billing status:', error)
    return NextResponse.json({ error: 'Failed to fetch billing status' }, { status: 500 })
  }
}
