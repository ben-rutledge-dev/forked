'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { ForkBrandIcon, UserIcon } from '@/components/Icons';

export const Nav = () => {
  const { data: session, status } = useSession();
  const t = useTranslations('nav');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setMenuOpen(false);
  const closeUserMenu = () => setUserMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        closeUserMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-primary-500 text-white">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-5xl font-semibold tracking-tight transition-colors font-fraunces"
          onClick={closeMenu}
        >
          <ForkBrandIcon className="w-10 opacity-90" />
          Forked
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/recipes"
            className="text-primary-100 hover:text-white transition-colors"
          >
            {t('myRecipes')}
          </Link>
          {session
            ? (
                <>
                  <Link
                    href="/meal-planner"
                    className="text-primary-100 hover:text-white transition-colors"
                  >
                    {t('mealPlanner')}
                  </Link>
                  <Link
                    href="/shopping-lists"
                    className="text-primary-100 hover:text-white transition-colors"
                  >
                    {t('shoppingLists')}
                  </Link>

                  {/* User dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 transition-colors overflow-hidden"
                      aria-label={t('userMenu')}
                      onClick={() => setUserMenuOpen(open => !open)}
                    >
                      {session.user.avatarUrl
                        ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={session.user.avatarUrl}
                              alt={session.user.name ?? t('userAvatar')}
                              className="w-full h-full object-cover"
                            />
                          )
                        : <UserIcon className="w-4 h-4 text-white" />}
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/10 py-1 z-50">
                        {session.user?.name && (
                          <div className="px-4 py-2 text-xs text-stone-400 border-b border-stone-100 truncate">
                            {session.user.name}
                          </div>
                        )}
                        <Link
                          href="/my/profile"
                          className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                          onClick={closeUserMenu}
                        >
                          {t('profile')}
                        </Link>
                        <div className="border-t border-stone-100 mt-1 pt-1">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
                            onClick={() => {
                              signOut();
                              closeUserMenu();
                            }}
                          >
                            {t('signOut')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
              href="/recipes"
              className="px-2 py-2.5 text-primary-100 hover:text-white transition-colors"
              onClick={closeMenu}
            >
              {t('myRecipes')}
            </Link>
            {session
              ? (
                  <>
                    <Link
                      href="/meal-planner"
                      className="px-2 py-2.5 text-primary-100 hover:text-white transition-colors"
                      onClick={closeMenu}
                    >
                      {t('mealPlanner')}
                    </Link>
                    <Link
                      href="/shopping-lists"
                      className="px-2 py-2.5 text-primary-100 hover:text-white transition-colors"
                      onClick={closeMenu}
                    >
                      {t('shoppingLists')}
                    </Link>
                    <div className="border-t border-white/20 mt-1 pt-1">
                      <Link
                        href="/my/profile"
                        className="block px-2 py-2.5 text-primary-100 hover:text-white transition-colors"
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
                    </div>
                  </>
                )
              : (
                  <div className="px-2 py-2.5">
                    <Button
                      variant="nav-pill"
                      size="md"
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
