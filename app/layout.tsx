import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
// Components
import { Providers } from './components/Providers';
import { Nav } from '@/components/Nav';
// Lib
import { auth } from '@/lib/auth';
import QueryProvider from './providers/QueryProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Forked',
    template: '%s — Forked',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const RootLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const session = await auth();
  const messages = await getMessages();
  const t = await getTranslations('layout');

  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body className="antialiased min-h-screen text-stone-900">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <Providers session={session}>
              <Nav />
              <main>{children}</main>
              <footer className="mt-16 border-t border-stone-100 py-8 text-center text-xs text-stone-400">
                {t('footer', { year: new Date().getFullYear() })}
              </footer>
            </Providers>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
