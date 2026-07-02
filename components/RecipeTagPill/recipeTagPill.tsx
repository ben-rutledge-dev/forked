import Link from 'next/link';
import type { ReactNode } from 'react';

const CLS = 'inline-block rounded-full bg-primary-50 dark:bg-stone-700 text-primary-600 dark:text-primary-300 px-2.5 py-0.5 text-xs font-medium';

type RecipeTagPillProps = {
  children: ReactNode
  href?: string
};

export const RecipeTagPill: React.FC<RecipeTagPillProps> = (props) => {
  const { children, href } = props;
  return href
    ? <Link href={href} className={CLS}>{children}</Link>
    : <span className={CLS}>{children}</span>;
};
