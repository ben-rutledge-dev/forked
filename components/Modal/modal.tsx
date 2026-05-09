'use client';

import { useContext } from 'react';
// Hooks
import { useModal } from '@/hooks/useModal';
// Store
import GlobalContext from '@/store/GlobalContext';

export const Modal = () => {
  const { state } = useContext(GlobalContext);
  const { onConfirm } = useModal();
  const { modal } = state;

  if (!modal.show || !modal.Component) return null;

  const { Component, props, maxWidth = 'max-w-sm', allowClose = true, cancelValue } = modal;

  const handleBackdropClick = () => {
    if (allowClose) onConfirm(cancelValue);
  };

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent w-full h-full max-w-none m-0"
    >
      {/* Backdrop */}
      <button
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40 cursor-default w-full"
        onClick={handleBackdropClick}
      />
      {/* Panel */}
      <div className={`relative w-full ${maxWidth} max-h-[90dvh] overflow-y-auto bg-white rounded-xl shadow-xl border border-stone-200`}>
        <Component {...props} onConfirm={onConfirm} />
      </div>
    </dialog>
  );
};
