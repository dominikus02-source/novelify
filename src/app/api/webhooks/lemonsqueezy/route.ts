import { NextRequest, NextResponse } from 'next/server'
import { processLemonSqueezyWebhook } from '@/lib/billing/providers/lemonsqueezy'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature') || ''

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const result = await processLemonSqueezyWebhook(rawBody, signature)

    if (!result.success && result.event === 'invalid_signature') {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    return NextResponse.json({ status: 'ok', event: result.event })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
