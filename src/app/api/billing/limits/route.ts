import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getPlanConfig } from '@/lib/billing/plans'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const config = getPlanConfig(user.plan)

    return NextResponse.json({ plan: user.plan, limits: config.limits })
  } catch (error) {
    console.error('Error fetching limits:', error)
    return NextResponse.json({ error: 'Failed to fetch limits' }, { status: 500 })
  }
}
