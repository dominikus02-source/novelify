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

    const [logs, total] = await Promise.all([
      db.usageEvent.findMany({
        where: { type: 'ai_credit' },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.usageEvent.count({ where: { type: 'ai_credit' } }),
    ]);

    const userIds = [...new Set(logs.map(l => l.userId))];
    const projectIds = [...new Set(logs.filter(l => l.projectId).map(l => l.projectId!))];

    const [users, projects] = await Promise.all([
      userIds.length > 0
        ? db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true, name: true } })
        : [],
      projectIds.length > 0
        ? db.project.findMany({ where: { id: { in: projectIds } }, select: { id: true, title: true } })
        : [],
    ]);

    const userMap: Record<string, { id: string; email: string; name: string | null }> = {};
    for (const u of users) userMap[u.id] = u;

    const projectMap: Record<string, { id: string; title: string }> = {};
    for (const p of projects) projectMap[p.id] = p;

    const logsWithRelations = logs.map(l => ({
      id: l.id,
      userId: l.userId,
      projectId: l.projectId,
      type: l.type,
      amount: l.amount,
      metadataJson: l.metadataJson,
      createdAt: l.createdAt,
      user: userMap[l.userId] || null,
      project: l.projectId ? projectMap[l.projectId] || null : null,
    }));

    return NextResponse.json({
      logs: logsWithRelations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
