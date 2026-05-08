import React, { useCallback, useContext } from 'react';
// Store
import GlobalContext from '@/store/GlobalContext';
import { HIDE_MODAL, SHOW_MODAL } from '@/store/reducer';

export type ModalProps<ComponentPropsType extends Record<string, unknown> = Record<string, unknown>> = {
  maxWidth?: string
  allowClose?: boolean
  backgroundScroll?: boolean
  Component: React.FC<ComponentPropsType>
  cancelValue?: unknown
  props?: Omit<ComponentPropsType, 'onConfirm'>
};

let resolveCallback: ((value: unknown) => void) | null = null;

export const useModal = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const modalState = state.modal;

  const closeModal = useCallback(() => {
    dispatch({
      type: HIDE_MODAL,
    });
  }, [dispatch]);

  const onConfirm = useCallback((value: unknown) => {
    closeModal();
    resolveCallback?.(value);
  }, [closeModal]);

  const modal = useCallback(<ReturnType = unknown, ComponentPropsType extends Record<string, unknown> = Record<string, unknown>>(modalProps: ModalProps<ComponentPropsType>): Promise<ReturnType | null> => {
    const {
      maxWidth = 'max-w-xl',
      allowClose = true,
      backgroundScroll = false,
      Component,
      cancelValue = null,
      props = {},
    } = modalProps;

    dispatch({
      type: SHOW_MODAL,
      payload: {
        maxWidth,
        allowClose,
        backgroundScroll,
        Component,
        cancelValue,
        props,
      },
    });
    return new Promise<ReturnType | null>((res) => {
      resolveCallback = res as (value: unknown) => void;
    });
  }, [dispatch]);

  return { modal, onConfirm, modalState };
};
