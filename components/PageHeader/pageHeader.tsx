'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';
// Components
import { ChevronLeftIcon } from '@/components/Icons';
import { PageHeading } from '@/components/Typography';

type Props = {
  title?: string
  titleContent?: React.ReactNode
  action?: React.ReactNode
  backHref?: string
  subtitle?: string
};

export const PageHeader: React.FC<Props> = (props) => {
  const { title, titleContent, action, backHref, subtitle } = props;
  const t = useTranslations('common');
  return (
    <div className="flex flex-col gap-1 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {backHref && (
            <Link href={backHref} className="text-stone-400 hover:text-stone-600 transition-colors -ml-1 p-1 rounded shrink-0">
              <ChevronLeftIcon className="w-5 h-5" />
              <span className="sr-only">{t('back')}</span>
            </Link>
          )}
          {titleContent ?? (title && <PageHeading>{title}</PageHeading>)}
        </div>
        <div className="flex items-center h-10 shrink-0">
          {action}
        </div>
      </div>
      {subtitle && <p className="text-stone-500 text-sm">{subtitle}</p>}
    </div>
  );
};
