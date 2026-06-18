import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

function isSuperAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase());
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions['adapter'],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        const userRole = isSuperAdminEmail(credentials.email) ? UserRole.SUPER_ADMIN : user.role;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: userRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.onboardingCompleted = (user as any).onboardingCompleted;
      }

      if (trigger === 'update') {
        const fresh = await db.user.findUnique({
          where: { id: token.id as string },
          select: { onboardingCompleted: true, role: true, email: true },
        });
        if (fresh) {
          token.onboardingCompleted = fresh.onboardingCompleted;
          if (isSuperAdminEmail(fresh.email || '')) {
            token.role = UserRole.SUPER_ADMIN;
          } else {
            token.role = fresh.role;
          }
        }
      }

      if (!token.role || token.role === 'USER') {
        const fresh = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, email: true, onboardingCompleted: true },
        });
        if (fresh) {
          token.onboardingCompleted = fresh.onboardingCompleted;
          if (isSuperAdminEmail(fresh.email || '')) {
            token.role = UserRole.SUPER_ADMIN;
          } else {
            token.role = fresh.role;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        (session.user as any).onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
    async signIn({ user }) {
      if (!user.email) return false;

      if (isSuperAdminEmail(user.email)) {
        await db.user.update({
          where: { id: user.id },
          data: { role: UserRole.SUPER_ADMIN },
        });
      }

      return true;
    },
  },
};
