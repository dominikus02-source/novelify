import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assertAdminAccess } from '@/lib/admin/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await assertAdminAccess();
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          genre: true,
          status: true,
          sourceLanguage: true,
          targetLanguage: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { chapters: true } },
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      db.project.count({ where }),
    ]);

    const serialized = projects.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      projects: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
