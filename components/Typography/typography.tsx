import React from 'react';

type Props = {
  className?: string
  children: React.ReactNode
};

export const PageHeading: React.FC<Props> = ({ className, children }) => (
  <h1 className={`text-2xl font-semibold text-stone-900${className ? ` ${className}` : ''}`}>
    {children}
  </h1>
);

export const SectionHeading: React.FC<Props> = ({ className, children }) => (
  <h2 className={`font-medium text-stone-900${className ? ` ${className}` : ''}`}>
    {children}
  </h2>
);

export const SectionLabel: React.FC<Props> = ({ className, children }) => (
  <h2 className={`text-xs font-semibold text-stone-400 uppercase tracking-wide${className ? ` ${className}` : ''}`}>
    {children}
  </h2>
);
