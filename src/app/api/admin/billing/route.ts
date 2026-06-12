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
    const provider = searchParams.get('provider');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (provider) where.provider = provider;
    if (type) where.type = type;
    if (status) where.status = status;

    const [events, total] = await Promise.all([
      db.billingEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.billingEvent.count({ where }),
    ]);

    const userIds = [...new Set(events.filter(e => e.userId).map(e => e.userId!))];
    const users = userIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, name: true },
        })
      : [];
    const userMap: Record<string, { id: string; email: string; name: string | null }> = {};
    for (const u of users) userMap[u.id] = u;

    const eventsWithUser = events.map(e => ({
      id: e.id,
      userId: e.userId,
      provider: e.provider,
      providerEventId: e.providerEventId,
      type: e.type,
      rawType: e.rawType,
      status: e.status,
      plan: e.plan,
      amount: e.amount,
      currency: e.currency,
      createdAt: e.createdAt,
      processedAt: e.processedAt,
      user: e.userId ? userMap[e.userId] || null : null,
    }));

    return NextResponse.json({
      events: eventsWithUser,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
