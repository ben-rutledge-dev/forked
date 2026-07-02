'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { FormBanner } from '@/components/FormBanner';
import { TextInput } from '@/components/TextInput';

const CALLBACK_URL = '/dashboard';

const PROVIDERS = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
];

const SignInPage = () => {
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const error = searchParams?.get('error');

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

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

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || sending) return;
    setSending(true);
    try {
      await signIn('nodemailer', { email, callbackUrl: CALLBACK_URL, redirect: false });
      setSentTo(email);
    }
    finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-stone-50 dark:bg-stone-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            Forked
          </Link>
          <p className="mt-2 text-stone-500 dark:text-stone-400 text-sm">{t('signInHeading')}</p>
        </div>

        {errorMessage && (
          <div className="mb-4">
            <FormBanner type="error" message={errorMessage} />
          </div>
        )}

        {sentTo
          ? (
              <div className="bg-white dark:bg-stone-800 rounded-xl squircle shadow-sm p-6 text-center">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('checkYourEmailHeading')}</h2>
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                  {t('checkYourEmailBody', { email: sentTo })}
                </p>
              </div>
            )
          : (
              <div className="bg-white dark:bg-stone-800 rounded-xl squircle shadow-sm p-6 space-y-3">
                {PROVIDERS.map(provider => (
                  <Button
                    key={provider.id}
                    variant="secondary"
                    size="lg"
                    onClick={() => signIn(provider.id, { callbackUrl: CALLBACK_URL })}
                    className="w-full"
                  >
                    {t('continueWith', { provider: provider.name })}
                  </Button>
                ))}

                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
                  <span className="text-xs uppercase tracking-wide text-stone-400 dark:text-stone-500">{t('orDivider')}</span>
                  <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
                </div>

                <form onSubmit={handleEmailSignIn} className="space-y-3">
                  <TextInput
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    aria-label={t('emailLabel')}
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={sending}
                    className="w-full"
                  >
                    {sending ? t('sendingMagicLink') : t('sendMagicLink')}
                  </Button>
                </form>
              </div>
            )}

        <p className="mt-6 text-center text-xs text-stone-400 dark:text-stone-500">
          {t('terms')}
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
