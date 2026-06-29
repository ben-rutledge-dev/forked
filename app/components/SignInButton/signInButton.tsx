'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
// Components
import { Button } from '@/components/Button';

export const SignInButton = () => {
  const t = useTranslations('auth');
  return (
    <Button
      variant="secondary"
      size="lg"

      onClick={() => signIn()}
      className="w-full sm:w-auto"
    >
      {t('signInToStart')}
    </Button>
  );
};
