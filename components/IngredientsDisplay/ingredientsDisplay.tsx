'use client';

import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
// Hooks
import { useUnitSystem } from '@/hooks/useUnitSystem';
// Components
import { SectionHeading } from '@/components/Typography';
// Types
import type { Ingredient } from '@/types';
// Utils
import { convertIngredient, formatQuantity, UNIT_META } from '@/utils/units';

type Props = {
  ingredients: Ingredient[]
  compact?: boolean
  action?: ReactNode
};

export const IngredientsDisplay = ({ ingredients, compact = false, action }: Props) => {
  const t = useTranslations('recipeDetail');
  const { system, toggle } = useUnitSystem();

  const hasConvertibleUnit = ingredients.some(ing => ing.unitKey !== null);

  const renderAmount = (ing: Ingredient): string | null => {
    if (ing.unitKey !== null && ing.quantity !== null) {
      const { quantity, unitKey } = convertIngredient(ing.quantity, ing.unitKey, system);
      const abbr = UNIT_META[unitKey]?.abbreviation ?? unitKey.toLowerCase();
      return `${formatQuantity(quantity)} ${abbr}`;
    }
    const qty = ing.quantity !== null ? String(ing.quantity) : '';
    const unit = ing.unit ?? '';
    if (!qty && !unit) return null;
    return [qty, unit].filter(Boolean).join(' ');
  };

  return (
    <div>
      <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-3'}`}>
        <div className="flex items-center gap-3">
          {compact
            ? <h3 className="text-sm font-medium text-stone-700">{t('ingredients')}</h3>
            : <SectionHeading>{t('ingredients')}</SectionHeading>}
          {hasConvertibleUnit && (
            <button
              type="button"
              onClick={toggle}
              className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2 transition-colors"
            >
              {system === 'imperial' ? t('switchToMetric') : t('switchToImperial')}
            </button>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <ul className={compact ? 'space-y-1 text-sm text-stone-600' : 'space-y-2'}>
        {ingredients.map((ing) => {
          const amount = renderAmount(ing);
          return (
            <li key={ing.id} className={`flex gap-2${compact ? '' : ' text-stone-700'}`}>
              <span className={`text-stone-400 shrink-0 ${compact ? 'min-w-16' : 'min-w-20 text-right'}`}>
                {amount}
              </span>
              <span>{ing.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
