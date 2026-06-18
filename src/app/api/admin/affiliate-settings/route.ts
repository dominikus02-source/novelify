import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let settings = await db.affiliateSettings.findFirst()
    if (!settings) {
      settings = await db.affiliateSettings.create({
        data: {
          standardCommissionRate: 0.30,
          topPartnerCommissionRate: 0.35,
          commissionDurationMonths: 12,
          cookieDurationDays: 60,
          minimumPayoutAmount: 50,
          commissionHoldingDays: 14,
          payoutCurrency: 'USD',
        },
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching affiliate settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const allowedFields = [
      'standardCommissionRate',
      'topPartnerCommissionRate',
      'commissionDurationMonths',
      'cookieDurationDays',
      'minimumPayoutAmount',
      'commissionHoldingDays',
      'payoutCurrency',
    ]

    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field]
      }
    }

    const existing = await db.affiliateSettings.findFirst()
    if (!existing) {
      await db.affiliateSettings.create({
        data: {
          standardCommissionRate: 0.30,
          topPartnerCommissionRate: 0.35,
          commissionDurationMonths: 12,
          cookieDurationDays: 60,
          minimumPayoutAmount: 50,
          commissionHoldingDays: 14,
          payoutCurrency: 'USD',
          ...data,
        } as any,
      })
    } else {
      await db.affiliateSettings.update({
        where: { id: existing.id },
        data: data as any,
      })
    }

    const updated = await db.affiliateSettings.findFirst()
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating affiliate settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
