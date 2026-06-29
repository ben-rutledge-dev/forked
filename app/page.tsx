import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
// Components
import { SignInButton } from './components/SignInButton';
import { Button } from '@/components/Button';
import { PageLayout } from '@/components/PageLayout';
// Lib
import { auth } from '@/lib/auth';

const Home = async () => {
  const session = await auth();

  if (session) redirect('/dashboard');

  const t = await getTranslations('home');

  return (
    <PageLayout width="narrow" py="spacious">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          {t('heading')}
        </h1>
        <p className="mt-6 text-lg text-stone-500 leading-relaxed">
          {t('description')}
        </p>
      </div>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Button variant="primary" size="lg" shape="pill" href="/recipes">
          {t('browsePool')}
        </Button>
        <SignInButton />
      </div>
    </PageLayout>
  );
};

export default Home;
