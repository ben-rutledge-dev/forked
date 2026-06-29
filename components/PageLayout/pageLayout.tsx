import React from 'react';

type Width = 'narrow' | 'wide';
type Py = 'none' | 'sm' | 'md' | 'spacious';

const widthClasses: Record<Width, string> = {
  narrow: 'max-w-2xl',
  wide: 'max-w-4xl',
};

const pyClasses: Record<Py, string> = {
  none: '',
  sm: 'pb-6 sm:py-10',
  md: 'py-10',
  spacious: 'py-24',
};

type Props = {
  width?: Width
  py?: Py
  children: React.ReactNode
};

export const PageLayout: React.FC<Props> = ({ width = 'wide', py = 'md', children }) => (
  <div className={`mx-auto px-4 sm:px-8 lg:px-12 ${widthClasses[width]} ${pyClasses[py]}`}>
    {children}
  </div>
);
