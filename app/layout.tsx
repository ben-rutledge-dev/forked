import type { Metadata } from 'next';
// Components
import { Providers } from './components/Providers';
import { Nav } from '@/components/Nav';
// Lib
import { auth } from '@/lib/auth';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Forked',
    template: '%s — Forked',
  },
};

const RootLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const session = await auth();

  return (
    <html lang="en">
      <body className="antialiased min-h-screen text-stone-900">
        <Providers session={session}>
          <Nav />
          <main>{children}</main>
          <footer className="mt-16 border-t border-stone-100 py-8 text-center text-xs text-stone-400">
            ©
            {' '}
            {new Date().getFullYear()}
            {' '}
            Forked
          </footer>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
