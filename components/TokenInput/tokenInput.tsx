'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, type KeyboardEvent } from 'react';
// Components
import { CategoryPillButton } from '@/components/CategoryPill';
import { CheckIcon, ChevronDownIcon } from '@/components/Icons';
import { SectionLabel } from '@/components/Typography';

export type TokenOption = {
  id: string
  label: string
  group?: string
};

type TokenInputProps = {
  mode: 'create' | 'select' | 'pills'
  value: string[]
  onChange: (value: string[]) => void
  options: TokenOption[]
  placeholder?: string
  groupLabels?: Record<string, string>
  groupOrder?: readonly string[] | string[]
  disabled?: boolean
};

export const TokenInput: React.FC<TokenInputProps> = (props) => {
  const { mode, value, onChange, options, placeholder = 'Type to search…', groupLabels, groupOrder, disabled } = props;
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useTranslations('common');

  if (mode === 'pills') {
    return (
      <PillSelect
        value={value}
        onChange={onChange}
        options={options}
        groupLabels={groupLabels}
        groupOrder={groupOrder}
        disabled={disabled}
      />
    );
  }

  const q = inputValue.toLowerCase();
  const filtered = q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;

  const ungrouped = filtered.filter(o => !o.group);

  const buildGroups = () => {
    const withGroup = filtered.filter(o => o.group);
    if (groupOrder && groupOrder.length > 0) {
      return (groupOrder as string[])
        .map(g => ({ key: g, items: withGroup.filter(o => o.group === g) }))
        .filter(g => g.items.length > 0);
    }
    const seen: Record<string, TokenOption[]> = {};
    withGroup.forEach((o) => {
      if (!seen[o.group!]) seen[o.group!] = [];
      seen[o.group!].push(o);
    });
    return Object.entries(seen).map(([key, items]) => ({ key, items }));
  };

  const groups = buildGroups();
  const flatOptions: TokenOption[] = [...ungrouped, ...groups.flatMap(g => g.items)];

  const select = (opt: TokenOption) => {
    if (value.includes(opt.id)) {
      onChange(value.filter(v => v !== opt.id));
    }
    else {
      onChange([...value, opt.id]);
    }
    setInputValue('');
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const removeToken = (id: string) => {
    onChange(value.filter(v => v !== id));
  };

  const openDropdown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setFocusedIndex(-1);
    }, 150);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setFocusedIndex(-1);
      return;
    }
    if (e.key === 'Tab') {
      setOpen(false);
      setFocusedIndex(-1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) openDropdown();
      setFocusedIndex(prev => Math.min(prev + 1, flatOptions.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => {
        if (prev <= 0) {
          setOpen(false);
          return -1;
        }
        return prev - 1;
      });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && flatOptions[focusedIndex]) {
        select(flatOptions[focusedIndex]);
        return;
      }
      if (mode === 'create' && inputValue.trim()) {
        const raw = inputValue.trim().toLowerCase();
        const match = options.find(o => o.label.toLowerCase() === raw);
        if (match) {
          select(match);
        }
        else {
          if (!value.includes(raw)) onChange([...value, raw]);
          setInputValue('');
          setOpen(false);
        }
        return;
      }
      if (mode === 'select' && flatOptions.length > 0) {
        select(flatOptions[0]);
      }
    }
  };

  const getLabel = (id: string) => options.find(o => o.id === id)?.label ?? id;

  return (
    <div className={`relative${disabled ? ' opacity-50 pointer-events-none' : ''}`}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map(id => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full border border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-sm text-stone-700 dark:text-stone-300"
            >
              {getLabel(id)}
              <button
                type="button"
                onClick={() => removeToken(id)}
                className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 leading-none"
                aria-label={t('removeToken', { label: getLabel(id) })}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            openDropdown();
          }}
          onFocus={openDropdown}
          onBlur={scheduleClose}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 pr-8 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-stone-500 dark:focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400"
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault();
            if (open) {
              setOpen(false);
            }
            else {
              openDropdown();
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400"
          aria-label={t('toggleDropdown')}
        >
          <ChevronDownIcon className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-md dark:shadow-stone-950/30 overflow-hidden">
          <ul className="max-h-60 overflow-y-auto py-1" role="listbox">
            {flatOptions.length === 0 && (
              <li className="px-3 py-2 text-sm text-stone-400 dark:text-stone-500">
                {mode === 'create' && inputValue.trim()
                  ? t('pressEnterToAdd', { value: inputValue.trim() })
                  : t('noOptionsFound')}
              </li>
            )}
            {ungrouped.map((opt) => {
              const idx = flatOptions.indexOf(opt);
              return (
                <OptionItem
                  key={opt.id}
                  opt={opt}
                  selected={value.includes(opt.id)}
                  focused={focusedIndex === idx}
                  onSelect={select}
                  onMouseEnter={() => setFocusedIndex(idx)}
                />
              );
            })}
            {groups.map(group => (
              <li key={group.key}>
                <SectionLabel className="px-3 py-1.5">
                  {groupLabels?.[group.key] ?? group.key}
                </SectionLabel>
                <ul>
                  {group.items.map((opt) => {
                    const idx = flatOptions.indexOf(opt);
                    return (
                      <OptionItem
                        key={opt.id}
                        opt={opt}
                        selected={value.includes(opt.id)}
                        focused={focusedIndex === idx}
                        onSelect={select}
                        onMouseEnter={() => setFocusedIndex(idx)}
                      />
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// — Pills mode —

type PillSelectProps = {
  value: string[]
  onChange: (value: string[]) => void
  options: TokenOption[]
  groupLabels?: Record<string, string>
  groupOrder?: readonly string[] | string[]
  disabled?: boolean
};

const PillSelect: React.FC<PillSelectProps> = (props) => {
  const { value, onChange, options, groupLabels, groupOrder, disabled } = props;
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);

  const ungrouped = options.filter(o => !o.group);

  const groups = (() => {
    const withGroup = options.filter(o => o.group);
    if (groupOrder && groupOrder.length > 0) {
      return (groupOrder as string[])
        .map(g => ({ key: g, items: withGroup.filter(o => o.group === g) }))
        .filter(g => g.items.length > 0);
    }
    const seen: Record<string, TokenOption[]> = {};
    withGroup.forEach((o) => {
      if (!seen[o.group!]) seen[o.group!] = [];
      seen[o.group!].push(o);
    });
    return Object.entries(seen).map(([key, items]) => ({ key, items }));
  })();

  const renderPill = (opt: TokenOption) => (
    <CategoryPillButton
      key={opt.id}
      active={value.includes(opt.id)}
      onClick={() => toggle(opt.id)}
    >
      {opt.label}
    </CategoryPillButton>
  );

  return (
    <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      {ungrouped.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ungrouped.map(renderPill)}
        </div>
      )}
      {groups.map((group, i) => (
        <div key={group.key} className={(ungrouped.length > 0 || i > 0) ? 'mt-3' : ''}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
            {groupLabels?.[group.key] ?? group.key}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map(renderPill)}
          </div>
        </div>
      ))}
    </div>
  );
};

// — Dropdown option item (used by create/select modes) —

type OptionItemProps = {
  opt: TokenOption
  selected: boolean
  focused: boolean
  onSelect: (opt: TokenOption) => void
  onMouseEnter: () => void
};

const OptionItem: React.FC<OptionItemProps> = (props) => {
  const { opt, selected, focused, onSelect, onMouseEnter } = props;
  return (
    <li
      role="option"
      aria-selected={selected}
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(opt);
      }}
      onMouseEnter={onMouseEnter}
      className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer select-none ${
        focused ? 'bg-stone-100 dark:bg-stone-700' : 'hover:bg-stone-50 dark:hover:bg-stone-700'
      } ${selected ? 'text-stone-500 dark:text-stone-400' : 'text-stone-700 dark:text-stone-300'}`}
    >
      <span>{opt.label}</span>
      {selected && (
        <CheckIcon className="w-3.5 h-3.5" />
      )}
    </li>
  );
};
