import React from 'react';

type Props = {
  className?: string
  children: React.ReactNode
};

export const PageHeading: React.FC<Props> = ({ className, children }) => (
  <h1 className={['font-fraunces text-2xl font-semibold text-stone-900', className].filter(Boolean).join(' ')}>
    {children}
  </h1>
);

export const ModalHeading: React.FC<Props> = ({ className, children }) => (
  <h2 className={['text-lg font-semibold text-stone-900', className].filter(Boolean).join(' ')}>
    {children}
  </h2>
);

export const SectionHeading: React.FC<Props> = ({ className, children }) => (
  <h2 className={['font-medium text-stone-900', className].filter(Boolean).join(' ')}>
    {children}
  </h2>
);

export const SectionLabel: React.FC<Props> = ({ className, children }) => (
  <h2 className={['text-xs font-semibold text-stone-400 uppercase tracking-wide', className].filter(Boolean).join(' ')}>
    {children}
  </h2>
);
