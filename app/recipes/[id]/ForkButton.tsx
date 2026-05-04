"use client";

import { useState, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ForkIcon } from "@/components/ForkIcon";

export function ForkButton({ recipeId }: { recipeId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [forking, setForking] = useState(false);
  const [iconAnimating, setIconAnimating] = useState(false);
  const pendingForkId = useRef<string | null>(null);

  async function handleFork() {
    if (!session) {
      signIn();
      return;
    }
    setForking(true);
    setIconAnimating(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/fork`, { method: "POST" });
      if (res.ok) {
        const fork = await res.json();
        pendingForkId.current = fork.id;
      }
    } finally {
      setForking(false);
    }
  }

  function handleAnimationDone() {
    setIconAnimating(false);
    if (pendingForkId.current) {
      router.push(`/my/recipes/${pendingForkId.current}/edit`);
      pendingForkId.current = null;
    }
  }

  return (
    <Button
      variant="primary"
      size="lg"
      shape="pill"
      onClick={handleFork}
      disabled={forking}
      className="shrink-0 flex items-center gap-2"
    >
      {forking ? "Forking…" : "Fork"}
      <ForkIcon animating={iconAnimating} onDone={handleAnimationDone} />
    </Button>
  );
}
