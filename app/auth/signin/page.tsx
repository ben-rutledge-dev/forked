"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/Button";

const PROVIDERS = [{ id: "github", name: "GitHub" }];

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-stone-900">
            Forked
          </Link>
          <p className="mt-2 text-stone-500 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-3">
          {PROVIDERS.map((provider) => (
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
  );
}
