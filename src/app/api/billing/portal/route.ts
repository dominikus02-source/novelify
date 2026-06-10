import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Online billing not configured yet' },
      { status: 400 },
    )
  } catch (error) {
    console.error('Error accessing portal:', error)
    return NextResponse.json({ error: 'Failed to access portal' }, { status: 500 })
  }
}
