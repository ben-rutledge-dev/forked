import { signIn, signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { ReactNode } from 'react';
// Components
import { Button } from '@/components/Button';

type Props = {
  children: ReactNode
  title?: string
};

export const Layout = ({ children, title = 'Forked' }: Props) => {
  const { data: session, status } = useSession();
  const t = useTranslations('nav');

  return (
    <>
      <Head>
        <title>{title === 'Forked' ? 'Forked' : `${title} — Forked`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen text-stone-900">
        <header className="bg-primary-500 text-white">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight transition-colors"
            >
              Forked
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/recipes"
                className="text-orange-100 hover:text-white transition-colors"
              >
                {t('pool')}
              </Link>
              {session
                ? (
                    <>
                      <Link
                        href="/recipes"
                        className="text-orange-100 hover:text-white transition-colors"
                      >
                        {t('myRecipes')}
                      </Link>
                      <Button variant="nav-link" onClick={() => signOut()}>
                        {t('signOut')}
                      </Button>
                    </>
                  )
                : (
                    <Button
                      variant="nav-pill"
                      size="md"

                      disabled={status === 'loading'}
                      onClick={() => signIn()}
                    >
                      {t('signIn')}
                    </Button>
                  )}
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </>
  );
};
