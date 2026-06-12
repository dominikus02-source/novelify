import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  const emails = getAdminEmails();
  return emails.includes(email.toLowerCase().trim());
}

export function isSuperAdmin(user: { role?: string | null } | null | undefined): boolean {
  return user?.role === UserRole.SUPER_ADMIN;
}

export function isAdmin(user: { role?: string | null } | null | undefined): boolean {
  return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
}

export async function getCurrentAdminUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, image: true },
  });
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentAdminUser();
  if (!user || !isAdmin(user)) return null;
  return user;
}

export async function requireSuperAdmin() {
  const user = await getCurrentAdminUser();
  if (!user || !isSuperAdmin(user)) return null;
  return user;
}

export async function assertAdminAccess() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}

export async function assertSuperAdminAccess() {
  const user = await requireSuperAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}

export function createUnauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function createForbiddenResponse() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
