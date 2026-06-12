import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assertAdminAccess } from '@/lib/admin/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, totalProjects, newUsersWeek, openFeedback, totalSubs, paidUsers, aiUsageMonth, exportsMonth, failedExports] = await Promise.all([
      db.user.count(),
      db.project.count(),
      db.user.count({ where: { createdAt: { gte: weekAgo } } }),
      db.feedback.count({ where: { status: { in: ['NEW', 'IN_PROGRESS'] } } }),
      db.subscription.count({ where: { status: { in: ['active', 'trialing'] } } }),
      db.user.count({ where: { plan: { not: 'free' } } }),
      db.usageEvent.count({ where: { type: 'ai_credit', createdAt: { gte: monthStart } } }),
      db.exportJob.count({ where: { createdAt: { gte: monthStart } } }),
      db.exportJob.count({ where: { status: 'failed', createdAt: { gte: monthStart } } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalProjects,
      newUsersWeek,
      openFeedback,
      totalSubs,
      paidUsers,
      aiUsageMonth,
      exportsMonth,
      failedExports,
    });
  } catch (error) {
    console.error('Admin summary error:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
