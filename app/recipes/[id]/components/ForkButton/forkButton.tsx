'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { ForkIcon } from '@/components/ForkIcon';

export const ForkButton = ({ recipeId }: { recipeId: string }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [forking, setForking] = useState(false);
  const [iconAnimating, setIconAnimating] = useState(false);
  const pendingForkId = useRef<string | null>(null);

  const handleFork = async () => {
    if (!session) {
      signIn();
      return;
    }
    setForking(true);
    setIconAnimating(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/fork`, { method: 'POST' });
      if (res.ok) {
        const fork = await res.json();
        pendingForkId.current = fork.id;
      }
    }
    finally {
      setForking(false);
    }
  };

  const handleAnimationDone = () => {
    setIconAnimating(false);
    if (pendingForkId.current) {
      router.push(`/my/recipes/${pendingForkId.current}/edit`);
      pendingForkId.current = null;
    }
  };

  return (
    <Button
      variant="primary"
      size="md"
      shape="pill"
      onClick={handleFork}
      disabled={forking}
      className="shrink-0 flex items-center gap-2"
    >
      {forking ? 'Forking…' : 'Fork'}
      <ForkIcon size={16} animating={iconAnimating} onDone={handleAnimationDone} />
    </Button>
  );
};
