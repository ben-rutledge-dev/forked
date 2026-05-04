import Head from "next/head";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title?: string;
};

export default function Layout({ children, title = "Forked" }: Props) {
  const { data: session, status } = useSession();

  return (
    <>
      <Head>
        <title>{title === "Forked" ? "Forked" : `${title} — Forked`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen text-stone-900">
        <header className="bg-primary-500 text-white">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight transition-colors"
            >
              Forked
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/pool"
                className="text-orange-100 hover:text-white transition-colors"
              >
                Pool
              </Link>
              {session ? (
                <>
                  <Link
                    href="/my/recipes"
                    className="text-orange-100 hover:text-white transition-colors"
                  >
                    My Recipes
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-orange-200 hover:text-white transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn()}
                  disabled={status === "loading"}
                  className="rounded-full bg-black/20 px-4 py-1.5 text-white hover:bg-black/30 transition-colors disabled:opacity-50"
                >
                  Sign in
                </button>
              )}
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </>
  );
}
