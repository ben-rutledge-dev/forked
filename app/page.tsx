import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignInButton } from "./components/SignInButton";

export default async function Home() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
        A recipe pool you can make your own.
      </h1>
      <p className="mt-6 text-lg text-stone-500 leading-relaxed">
        Browse a shared library of recipes. Fork any one into your private
        collection. Edit it, adapt it, make it yours — without touching the
        original.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/pool"
          className="w-full rounded-full bg-primary-500 px-8 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors sm:w-auto"
        >
          Browse the pool
        </Link>
        {session ? (
          <Link
            href="/my/recipes"
            className="w-full rounded-full border border-stone-300 px-8 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors sm:w-auto"
          >
            My recipes
          </Link>
        ) : (
          <SignInButton />
        )}
      </div>
    </div>
  );
}
