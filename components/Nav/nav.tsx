'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { ForkBrandIcon } from '@/components/Icons';

export const Nav = () => {
  const { data: session, status } = useSession();
  const t = useTranslations('nav');
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="bg-primary-500 text-white">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-5xl font-semibold tracking-tight transition-colors"
          onClick={closeMenu}
        >
          <ForkBrandIcon className="w-10 opacity-90" />
          Forked
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/pool"
            className="text-primary-100 hover:text-white transition-colors"
          >
            {t('pool')}
          </Link>
          {session
            ? (
                <>
                  <Link
                    href="/my/recipes"
                    className="text-primary-100 hover:text-white transition-colors"
                  >
                    {t('myRecipes')}
                  </Link>
                  <Link
                    href="/shopping-lists"
                    className="text-primary-100 hover:text-white transition-colors"
                  >
                    {t('shoppingLists')}
                  </Link>
                  <Link
                    href="/meal-planner"
                    className="text-primary-100 hover:text-white transition-colors"
                  >
                    {t('mealPlanner')}
                  </Link>
                  <Link
                    href="/my/profile"
                    className="text-primary-100 hover:text-white transition-colors"
                  >
                    {t('profile')}
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
                  shape="pill"
                  disabled={status === 'loading'}
                  onClick={() => signIn()}
                >
                  {t('signIn')}
                </Button>
              )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-black/20 transition-colors"
          aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
          onClick={() => setMenuOpen(open => !open)}
        >
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/20 bg-primary-600">
          <div className="mx-auto max-w-4xl flex flex-col px-4 py-3 gap-1 text-sm">
            <Link
              href="/pool"
              className="px-2 py-2.5 text-primary-100 hover:text-white transition-colors"
              onClick={closeMenu}
            >
              {t('pool')}
            </Link>
            {session
              ? (
                  <>
                    <Link
                      href="/my/recipes"
                      className="px-2 py-2.5 text-primary-100 hover:text-white transition-colors"
                      onClick={closeMenu}
                    >
                      {t('myRecipes')}
                    </Link>
                    <Link
                      href="/shopping-lists"
                      className="px-2 py-2.5 text-primary-100 hover:text-white transition-colors"
                      onClick={closeMenu}
                    >
                      {t('shoppingLists')}
                    </Link>
                    <Link
                      href="/meal-planner"
                      className="px-2 py-2.5 text-primary-100 hover:text-white transition-colors"
                      onClick={closeMenu}
                    >
                      {t('mealPlanner')}
                    </Link>
                    <Link
                      href="/my/profile"
                      className="px-2 py-2.5 text-primary-100 hover:text-white transition-colors"
                      onClick={closeMenu}
                    >
                      {t('profile')}
                    </Link>
                    <button
                      className="px-2 py-2.5 text-left text-primary-200 hover:text-white transition-colors"
                      onClick={() => {
                        signOut();
                        closeMenu();
                      }}
                    >
                      {t('signOut')}
                    </button>
                  </>
                )
              : (
                  <div className="px-2 py-2.5">
                    <Button
                      variant="nav-pill"
                      size="md"
                      shape="pill"
                      disabled={status === 'loading'}
                      onClick={() => {
                        signIn();
                        closeMenu();
                      }}
                    >
                      {t('signIn')}
                    </Button>
                  </div>
                )}
          </div>
        </div>
      )}
    </header>
  );
};
