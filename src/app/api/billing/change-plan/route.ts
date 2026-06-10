import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { PLAN_TIERS } from '@/lib/billing/plans'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Online billing not configured yet' },
        { status: 400 },
      )
    }

    const body = await request.json()

    if (!body.plan || !PLAN_TIERS.includes(body.plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: ' + PLAN_TIERS.join(', ') },
        { status: 400 },
      )
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { plan: body.plan },
    })

    const subscription = await db.subscription.upsert({
      where: { userId: session.user.id },
      update: { plan: body.plan, status: 'active', provider: 'manual' },
      create: {
        userId: session.user.id,
        plan: body.plan,
        status: 'active',
        provider: 'manual',
      },
    })

    return NextResponse.json({ success: true, plan: user.plan, subscription })
  } catch (error) {
    console.error('Error changing plan:', error)
    return NextResponse.json({ error: 'Failed to change plan' }, { status: 500 })
  }
}
