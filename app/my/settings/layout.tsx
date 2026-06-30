import { getTranslations } from 'next-intl/server';
// Components
import { SettingsSidebar } from './components/SettingsSidebar';

const SettingsLayout = async ({ children }: { children: React.ReactNode }) => {
  const t = await getTranslations('settings');

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 lg:px-12 py-10">
      <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-8">
        {t('heading')}
      </h1>
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
        <SettingsSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
};

export default SettingsLayout;
