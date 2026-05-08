import { useCallback } from 'react';
// Components
import { AlertConfirm } from '@/components/AlertConfirm';
// Types
import type { AlertConfirmProps } from '@/components/AlertConfirm';
// Hooks
import { useModal } from '@/hooks/useModal';

type Text = AlertConfirmProps['text'];
type ComponentProps = Omit<AlertConfirmProps, 'text' | 'onConfirm'>;

export const useConfirm = () => {
  const { modal, onConfirm, modalState } = useModal();

  const confirm = useCallback(async (text: Text, props?: ComponentProps) => {
    return await modal({
      Component: AlertConfirm,
      cancelValue: false,
      props: {
        text,
        ...props,
      },
    });
  }, [modal]);

  return { confirm, onConfirm, modalState };
};
