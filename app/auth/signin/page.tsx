'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
// Components
import { Button } from '@/components/Button';
import { FormBanner } from '@/components/FormBanner';

const PROVIDERS = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
];

const SignInPage = () => {
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const error = searchParams?.get('error');

  const getErrorMessage = (errorCode: string): string => {
    const key = `errors.${errorCode}` as Parameters<typeof t>[0];
    try {
      return t(key);
    }
    catch {
      return `${t('errors.Default')} (${errorCode})`;
    }
  };

  const errorMessage = error ? getErrorMessage(error) : null;

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-stone-900">
            Forked
          </Link>
          <p className="mt-2 text-stone-500 text-sm">{t('signInHeading')}</p>
        </div>

        {errorMessage && (
          <div className="mb-4">
            <FormBanner type="error" message={errorMessage} />
          </div>
        )}

        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-3">
          {PROVIDERS.map(provider => (
            <Button
              key={provider.id}
              variant="secondary"
              size="lg"
              shape="rounded"
              onClick={() => signIn(provider.id, { callbackUrl: '/my/recipes' })}
              className="w-full"
            >
              {t('continueWith', { provider: provider.name })}
            </Button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          {t('terms')}
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
