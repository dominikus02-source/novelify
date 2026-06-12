import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assertAdminAccess } from '@/lib/admin/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlySummary, usageRecords, total] = await Promise.all([
      db.usageEvent.groupBy({
        by: ['type'],
        where: { createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      db.usageTracking.findMany({
        skip,
        take: limit,
        orderBy: { periodStart: 'desc' },
        select: {
          id: true,
          aiCreditsUsed: true,
          revisionChecksUsed: true,
          translationWordsUsed: true,
          exportsUsed: true,
          periodStart: true,
          periodEnd: true,
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      db.usageTracking.count(),
    ]);

    const summaryMap: Record<string, number> = {};
    monthlySummary.forEach((item) => {
      summaryMap[item.type] = (item._sum.amount || 0);
    });

    const serialized = usageRecords.map((r) => ({
      ...r,
      periodStart: r.periodStart.toISOString(),
      periodEnd: r.periodEnd.toISOString(),
    }));

    return NextResponse.json({
      summary: {
        aiCredits: summaryMap.ai_credit || 0,
        revisions: (summaryMap.revision_check || 0) + (summaryMap.full_revision_check || 0),
        translationWords: summaryMap.translation_word || 0,
        exports: summaryMap.export || 0,
      },
      records: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin usage error:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
