'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Data
import type { ShoppingListWithStats } from '@/data/shopping-lists/types';

type Props = {
  lists: ShoppingListWithStats[]
  compact?: boolean
  selectedListId?: string | null
  onSelectList?: (id: string) => void
};

export const ShoppingListsSection = ({ lists, compact, selectedListId, onSelectList }: Props) => {
  const t = useTranslations('dashboard.shoppingLists');
  const router = useRouter();
  const isSelectable = !!onSelectList;

  const listMeta = (list: ShoppingListWithStats) => {
    const itemLabel = list.uncheckedCount === 0 ? t('empty') : t('items', { count: list.uncheckedCount });
    return `${itemLabel} · ${t('members', { count: list.memberCount })}`;
  };

  if (lists.length === 0) {
    if (compact) {
      return (
        <Link
          href="/shopping-lists"
          className="rounded-lg border border-dashed border-stone-300 px-4 py-3 text-xs text-stone-400 text-center hover:border-stone-400 transition-colors block"
        >
          {t('newList')}
        </Link>
      );
    }
    return (
      <div className="rounded-xl squircle shadow-sm bg-white px-5 py-6 text-center">
        <p className="text-sm text-stone-500 mb-2">{t('noListsYet')}</p>
        <Link href="/shopping-lists" className="text-xs text-primary-500 hover:underline">
          {t('createList')}
        </Link>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        {lists.map((list) => {
          const isActive = selectedListId === list.id;
          return isSelectable
            ? (
                <button
                  key={list.id}
                  className={`w-full text-left rounded-xl squircle px-4 py-3 transition-all cursor-pointer ${isActive ? 'shadow-md ring-2 ring-primary-500' : 'shadow-sm hover:shadow-md'}`}
                  onClick={() => onSelectList(list.id)}
                >
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-stone-900' : 'text-stone-500'}`}>
                    {list.title}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{listMeta(list)}</p>
                </button>
              )
            : (
                <button
                  key={list.id}
                  className="w-full text-left rounded-xl squircle border border-stone-200 px-4 py-3 hover:border-stone-300 transition-colors cursor-pointer"
                  onClick={() => router.push(`/shopping-lists/${list.id}`)}
                >
                  <p className="text-sm font-medium text-stone-800 truncate">{list.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{listMeta(list)}</p>
                </button>
              );
        })}
        <Link href="/shopping-lists" className="text-xs text-primary-500 hover:underline px-1 pt-1">
          {t('seeAll')}
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {lists.map(list => (
        <li key={list.id}>
          <button
            className="w-full text-left rounded-xl squircle shadow-sm px-5 py-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/shopping-lists/${list.id}`)}
          >
            <p className="font-medium text-stone-800">{list.title}</p>
            <p className="mt-1 text-xs text-stone-400">{listMeta(list)}</p>
          </button>
        </li>
      ))}
    </ul>
  );
};
