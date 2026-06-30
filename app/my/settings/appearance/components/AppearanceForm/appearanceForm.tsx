'use client';

import { useTranslations } from 'next-intl';
// Hooks
import { useTheme } from '@/hooks/useTheme';
import { useUnitSystem } from '@/hooks/useUnitSystem';
// Components
import { MoonIcon, SunIcon } from '@/components/Icons';
import { Toggle } from '@/components/Toggle';

export const AppearanceForm = () => {
  const t = useTranslations('settings');
  const { theme, toggle: toggleTheme } = useTheme();
  const { system, toggle: toggleUnit } = useUnitSystem();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
          {t('appearanceHeading')}
        </h2>
        <div className="mt-4 divide-y divide-stone-100 dark:divide-stone-700 rounded-xl squircle shadow-sm dark:shadow-stone-950/30 bg-white dark:bg-stone-800 overflow-hidden">
          {/* Dark mode row */}
          <div className="flex items-center justify-between gap-4 px-4 py-4">
            <div className="flex items-center gap-3">
              {theme === 'dark'
                ? <MoonIcon className="w-5 h-5 text-stone-400 dark:text-stone-300 shrink-0" />
                : <SunIcon className="w-5 h-5 text-stone-400 shrink-0" />}
              <div>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{t('darkModeLabel')}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{t('darkModeDescription')}</p>
              </div>
            </div>
            <Toggle checked={theme === 'dark'} onChange={() => toggleTheme()} />
          </div>

          {/* Unit system row */}
          <div className="flex items-center justify-between gap-4 px-4 py-4">
            <div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{t('unitSystemLabel')}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">{t('unitSystemDescription')}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => system !== 'metric' && toggleUnit()}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  system === 'metric'
                    ? 'bg-primary-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600'
                }`}
              >
                {t('metric')}
              </button>
              <button
                type="button"
                onClick={() => system !== 'imperial' && toggleUnit()}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  system === 'imperial'
                    ? 'bg-primary-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600'
                }`}
              >
                {t('imperial')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
