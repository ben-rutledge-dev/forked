import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { getProviders, signIn } from "next-auth/react";
import { authOptions } from "@/lib/auth";
import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Provider = { id: string; name: string };

type Props = { providers: Record<string, Provider> };

export default function SignIn({ providers }: Props) {
  return (
    <>
      <Head>
        <title>Sign in — Forked</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-stone-900">
              Forked
            </Link>
            <p className="mt-2 text-stone-500 text-sm">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-3">
            {Object.values(providers).map((provider) => (
              <Button
                key={provider.id}
                variant="secondary"
                size="lg"
                shape="rounded"
                onClick={() => signIn(provider.id, { callbackUrl: "/my/recipes" })}
                className="w-full"
              >
                Continue with {provider.name}
              </Button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-stone-400">
            By signing in you agree to keep cooking.
          </p>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (session) {
    return { redirect: { destination: "/my/recipes", permanent: false } };
  }

  const providers = await getProviders();
  return { props: { providers: providers ?? {} } };
};
