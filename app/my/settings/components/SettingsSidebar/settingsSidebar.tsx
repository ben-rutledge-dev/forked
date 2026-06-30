'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Components
import { CogIcon, ShieldIcon, SparklesIcon, UserIcon } from '@/components/Icons';

const sections = [
  { key: 'appearance', href: '/my/settings/appearance', Icon: CogIcon },
  { key: 'suggestions', href: '/my/settings/suggestions', Icon: SparklesIcon },
  { key: 'profile', href: '/my/settings/profile', Icon: UserIcon },
  { key: 'privacy', href: '/my/settings/privacy', Icon: ShieldIcon },
] as const;

export const SettingsSidebar = () => {
  const pathname = usePathname();
  const t = useTranslations('settings');

  return (
    <nav aria-label={t('settingsNavLabel')}>
      {/* Mobile: horizontal tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 sm:hidden">
        {sections.map(({ key, href, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={key}
              href={href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-stone-100 text-stone-900 dark:bg-stone-700 dark:text-stone-100'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {t(key)}
            </Link>
          );
        })}
      </div>

      {/* Desktop: vertical sidebar */}
      <div className="hidden sm:flex sm:flex-col sm:w-44 sm:shrink-0 gap-0.5">
        {sections.map(({ key, href, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={key}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-stone-100 text-stone-900 dark:bg-stone-700 dark:text-stone-100'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
