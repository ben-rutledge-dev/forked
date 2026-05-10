import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaPg } from '@prisma/adapter-pg';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
// Lib
import { PrismaClient } from '@/generated/prisma/client';

// NextAuth needs its own client — PrismaAdapter is incompatible with the
// driver-adapter pattern used in lib/prisma.ts
const authPrisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

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
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
