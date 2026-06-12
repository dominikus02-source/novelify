import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { assertAdminAccess } from '@/lib/admin/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await assertAdminAccess();
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const plan = searchParams.get('plan');
    const status = searchParams.get('status');
    const provider = searchParams.get('provider');

    const where: Record<string, unknown> = {};
    if (plan) where.plan = plan;
    if (status) where.status = status;
    if (provider) where.provider = provider;

    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        where,
        select: {
          id: true,
          userId: true,
          plan: true,
          status: true,
          provider: true,
          providerCustomerId: true,
          providerSubscriptionId: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          trialEndsAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, email: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.subscription.count({ where }),
    ]);

    const userIds = subscriptions.map(s => s.userId);
    const latestEvents = userIds.length > 0
      ? await db.$queryRawUnsafe<Array<{
          id: string; user_id: string; type: string; status: string | null;
          amount: number | null; currency: string | null; created_at: Date;
        }>>(
          `SELECT DISTINCT ON (b.user_id) b.id, b.user_id, b.type, b.status, b.amount, b.currency, b.created_at
           FROM "BillingEvent" b
           WHERE b.user_id IN (${userIds.map((_, i) => `$${i + 1}`).join(',')})
           ORDER BY b.user_id, b.created_at DESC`,
          ...userIds
        )
      : [];

    const eventMap = new Map(latestEvents.map(e => [e.user_id, {
      id: e.id, type: e.type, status: e.status,
      amount: e.amount, currency: e.currency, createdAt: e.created_at,
    }]));

    const subscriptionsWithEvent = subscriptions.map(sub => ({
      ...sub,
      latestBillingEvent: eventMap.get(sub.userId) || null,
    }));

    return NextResponse.json({
      subscriptions: subscriptionsWithEvent,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
