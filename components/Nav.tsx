"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export default function Nav() {
  const { data: session, status } = useSession();

  return (
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
            className="text-primary-100 hover:text-white transition-colors"
          >
            Pool
          </Link>
          {session ? (
            <>
              <Link
                href="/my/recipes"
                className="text-primary-100 hover:text-white transition-colors"
              >
                My Recipes
              </Link>
              <Button variant="nav-link" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <Button
              variant="nav-pill"
              size="md"
              shape="pill"
              disabled={status === "loading"}
              onClick={() => signIn()}
            >
              Sign in
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
