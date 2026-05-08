'use client';

import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
// Components
import { Modal } from '@/components/Modal';
// Store
import { GlobalProvider } from '@/store/GlobalContext';

export const Providers = ({
  session,
  children,
}: {
  session: Session | null
  children: React.ReactNode
}) => {
  return (
    <GlobalProvider>
      <SessionProvider session={session}>
        {children}
        <Modal />
      </SessionProvider>
    </GlobalProvider>
  );
};
