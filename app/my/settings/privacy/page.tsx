import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
// Components
import { PrivacyForm } from './components/PrivacyForm';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Settings — Privacy' };

const PrivacyPage = async () => {
  const session = await auth();
  const t = await getTranslations('settings');

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { isPublic: true, showName: true },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
        {t('privacyHeading')}
      </h2>
      <PrivacyForm isPublic={user!.isPublic} showName={user!.showName} />
    </div>
  );
};

export default PrivacyPage;
