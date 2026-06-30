import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaPg } from '@prisma/adapter-pg';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
// Lib
import { PrismaClient } from '@/generated/prisma/client';

// NextAuth needs its own client — PrismaAdapter is incompatible with the
// driver-adapter pattern used in lib/prisma.ts.
// Global singleton prevents connection pool exhaustion from HMR reloads in dev.
const globalForAuthPrisma = globalThis as unknown as { authPrisma: PrismaClient };
const authPrisma = globalForAuthPrisma.authPrisma ?? new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
if (process.env.NODE_ENV !== 'production') globalForAuthPrisma.authPrisma = authPrisma;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(authPrisma as any),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    session: ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        // Prefer the user-uploaded avatar over the OAuth provider image
        session.user.avatarUrl = (user as { avatarUrl?: string | null }).avatarUrl ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
