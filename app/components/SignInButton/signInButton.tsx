"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/Button";

export function SignInButton() {
  return (
    <Button
      variant="secondary"
      size="lg"
      shape="pill"
      onClick={() => signIn()}
      className="w-full sm:w-auto"
    >
      Sign in to start collecting
    </Button>
  );
}
