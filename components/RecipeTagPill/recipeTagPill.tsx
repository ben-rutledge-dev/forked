import Link from 'next/link';
import type { ReactNode } from 'react';

const CLS = 'inline-block rounded-full bg-primary-50 dark:bg-stone-700 text-primary-600 dark:text-primary-300 px-2.5 py-0.5 text-xs font-medium';

type Props = {
  children: ReactNode
  href?: string
};

export const RecipeTagPill = ({ children, href }: Props) => href
  ? <Link href={href} className={CLS}>{children}</Link>
  : <span className={CLS}>{children}</span>;
