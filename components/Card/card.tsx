'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

export const cardIconBtnCls
  = 'flex items-center justify-center w-7 h-7 rounded-lg bg-white/90 text-stone-500 hover:bg-white hover:text-stone-700 shadow-sm transition-colors cursor-pointer';

export type CardMenuSubItem = {
  label: string
  onClick: () => void
  disabled?: boolean
};

export type CardMenuItem = {
  label: string
  onClick?: () => void
  disabled?: boolean
  subMenu?: {
    title: string
    emptyLabel?: string
    items: CardMenuSubItem[] | null
    onOpen?: () => void
  }
};

export type CardAction = {
  title: string
  Icon: React.ReactNode
  onClick?: () => void
  menuItems?: CardMenuItem[]
};

type ActionProps = {
  action: CardAction
  isOpen: boolean
  activeSubMenu: NonNullable<CardMenuItem['subMenu']> | null
  onToggle: () => void
  onMenuItemClick: (item: CardMenuItem, index: number) => void
  onSubMenuBack: () => void
  onClose: () => void
};

const Action = ({ action, isOpen, activeSubMenu, onToggle, onMenuItemClick, onSubMenuBack, onClose }: ActionProps) => (
  <div className="relative">
    <button title={action.title} className={cardIconBtnCls} onClick={onToggle}>
      {action.Icon}
    </button>
    {isOpen && action.menuItems && (
      <div className="absolute right-0 top-8 z-30">
        {activeSubMenu
          ? (
              <div className="w-52 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100">
                  <button onClick={onSubMenuBack} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs font-medium text-stone-500">{activeSubMenu.title}</span>
                </div>
                {activeSubMenu.items === null
                  ? (
                      <div className="px-4 py-3 text-sm text-stone-400">Loading…</div>
                    )
                  : activeSubMenu.items.length === 0
                    ? (
                        <div className="px-4 py-3 text-sm text-stone-400">{activeSubMenu.emptyLabel ?? 'No items.'}</div>
                      )
                    : (
                        <div className="max-h-48 overflow-y-auto">
                          {activeSubMenu.items.map(subItem => (
                            <button
                              key={subItem.label}
                              disabled={subItem.disabled}
                              onClick={() => {
                                subItem.onClick();
                                onClose();
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 cursor-pointer truncate"
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      )}
              </div>
            )
          : (
              <div className="w-48 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
                {action.menuItems.map((item, j) => (
                  <button
                    key={item.label}
                    disabled={item.disabled}
                    onClick={() => onMenuItemClick(item, j)}
                    className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
      </div>
    )}
  </div>
);

type ActionsProps = {
  actions: CardAction[]
};

const Actions = ({ actions }: ActionsProps) => {
  const [openActionIndex, setOpenActionIndex] = useState<number | null>(null);
  const [activeSubMenuIndex, setActiveSubMenuIndex] = useState<number | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openActionIndex === null) return;
    const handleClick = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setOpenActionIndex(null);
        setActiveSubMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openActionIndex]);

  const handleActionToggle = (action: CardAction, index: number) => {
    if (action.menuItems) {
      if (openActionIndex === index) {
        setOpenActionIndex(null);
        setActiveSubMenuIndex(null);
      }
      else {
        setOpenActionIndex(index);
        setActiveSubMenuIndex(null);
      }
    }
    else {
      action.onClick?.();
    }
  };

  const handleMenuItemClick = (item: CardMenuItem, index: number) => {
    if (item.subMenu) {
      item.subMenu.onOpen?.();
      setActiveSubMenuIndex(index);
    }
    else {
      item.onClick?.();
      setOpenActionIndex(null);
    }
  };

  const openAction = openActionIndex === null ? null : actions[openActionIndex];
  const activeSubMenu
    = openAction && activeSubMenuIndex !== null
      ? openAction.menuItems?.[activeSubMenuIndex]?.subMenu ?? null
      : null;

  return (
    <div
      ref={actionsRef}
      className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={e => e.stopPropagation()}
    >
      {actions.map((action, i) => (
        <Action
          key={action.title}
          action={action}
          isOpen={openActionIndex === i}
          activeSubMenu={openActionIndex === i ? activeSubMenu : null}
          onToggle={() => handleActionToggle(action, i)}
          onMenuItemClick={handleMenuItemClick}
          onSubMenuBack={() => setActiveSubMenuIndex(null)}
          onClose={() => {
            setOpenActionIndex(null);
            setActiveSubMenuIndex(null);
          }}
        />
      ))}
    </div>
  );
};

type CardProps = {
  href: string
  coverImageUrl?: string | null
  CoverPlaceholderIcon: React.ReactNode
  actions?: CardAction[]
  children: React.ReactNode
  className?: string
};

export const Card = ({ href, coverImageUrl, CoverPlaceholderIcon, actions, children, className = '' }: CardProps) => {
  const router = useRouter();

  return (
    <div
      className={`group relative flex flex-col rounded-xl border border-stone-200 bg-white overflow-hidden hover:border-stone-300 transition-colors cursor-pointer ${className}`}
      onClick={() => router.push(href)}
      onKeyDown={e => e.key === 'Enter' && router.push(href)}
      role="link"
      tabIndex={0}
    >
      <div className="pointer-events-none relative h-36">
        {coverImageUrl
          ? (
              <Image src={coverImageUrl} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
            )
          : (
              <div className="w-full h-36 bg-stone-100 flex items-center justify-center">
                {CoverPlaceholderIcon}
              </div>
            )}
      </div>

      {actions && actions.length > 0 && <Actions actions={actions} />}

      <div className="flex flex-col flex-1 p-5 gap-3" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
