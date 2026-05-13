import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
// Components
import { SignInButton } from './components/SignInButton';
// Lib
import { auth } from '@/lib/auth';

const Home = async () => {
  const session = await auth();
  const t = await getTranslations('home');

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
        {t('heading')}
      </h1>
      <p className="mt-6 text-lg text-stone-500 leading-relaxed">
        {t('description')}
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/pool"
          className="w-full rounded-full bg-primary-500 px-8 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors sm:w-auto"
        >
          {t('browsePool')}
        </Link>
        {session
          ? (
              <Link
                href="/my/recipes"
                className="w-full rounded-full border border-stone-300 px-8 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors sm:w-auto"
              >
                {t('myRecipes')}
              </Link>
            )
          : (
              <SignInButton />
            )}
      </div>
    </div>
  );
};

export default Home;
