import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { assertSuperAdminAccess } from '@/lib/admin/admin-auth';

export async function GET() {
  try {
    const auth = await assertSuperAdminAccess();
    if (auth instanceof NextResponse) return auth;

    let databaseStatus: 'connected' | 'error' = 'connected';
    try {
      await db.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = 'error';
    }

    const lastEvent = await db.billingEvent.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, type: true },
    });

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      database: databaseStatus,
      lemonsqueezy: {
        configured: Boolean(process.env.LEMONSQUEEZY_API_KEY || process.env.LEMONSQUEEZY_STORE_ID),
      },
      midtrans: {
        configured: Boolean(process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_CLIENT_KEY),
      },
      aiProvider: {
        configured: Boolean(
          process.env.Z_AI_API_KEY ||
          process.env.OPENAI_API_KEY ||
          process.env.ANTHROPIC_API_KEY
        ),
      },
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
      lastWebhookEvent: lastEvent
        ? { time: lastEvent.createdAt.toISOString(), type: lastEvent.type }
        : null,
      adminEmailsConfigured: Boolean(process.env.ADMIN_EMAILS),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
