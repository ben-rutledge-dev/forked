import { getTranslations } from 'next-intl/server';

const NotFound = async () => {
  const t = await getTranslations('notFound');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-stone-500">
      <p className="text-6xl font-semibold text-stone-200">{t('code')}</p>
      <p>{t('message')}</p>
    </div>
  );
};

export default NotFound;
