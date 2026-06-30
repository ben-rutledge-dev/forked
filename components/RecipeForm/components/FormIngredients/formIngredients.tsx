'use client';

import { useTranslations } from 'next-intl';
// Hooks
import { useListField } from '@/hooks/useListField';
// Components
import { IconButton } from '@/components/IconButton';
import { RemoveButton } from '@/components/RecipeForm/components/RemoveButton';
import { TextInput } from '@/components/TextInput';
import { SectionHeading } from '@/components/Typography';
import { UnitSelect } from '@/components/UnitSelect';
// Types
import { IngredientFormData } from '@/types';

type IngredientItem = IngredientFormData & { _id: string };

type Props = {
  ingredients: IngredientItem[]
  actions: ReturnType<typeof useListField<IngredientItem>>
  emptyIngredient: () => IngredientItem
  ingredientErrors?: Set<string>
  onClearError?: (id: string) => void
};

export const FormIngredients = ({ ingredients, actions, emptyIngredient, ingredientErrors, onClearError }: Props) => {
  const t = useTranslations('formIngredients');

  return (
    <div>
      <div className="mb-3">
        <SectionHeading>{t('heading')}</SectionHeading>
      </div>
      <div className="flex items-center gap-2 mb-1 pl-15 pr-9">
        <span className="w-16 text-xs text-stone-400 dark:text-stone-500 font-medium">{t('qty')}</span>
        <span className="w-28 text-xs text-stone-400 dark:text-stone-500 font-medium">{t('unit')}</span>
        <span className="flex-1 text-xs text-stone-400 dark:text-stone-500 font-medium">{t('ingredient')}</span>
      </div>
      <div className="space-y-2">
        {ingredients.map((ing, i) => (
          <div key={ing._id} className="flex items-start gap-2">
            <div className="flex flex-col gap-1 mr-1 mt-1">
              <IconButton
                type="button"
                onClick={() => actions.move(ing._id, -1)}
                disabled={i === 0}
              >
                ▲
              </IconButton>
              <IconButton
                type="button"
                onClick={() => actions.move(ing._id, 1)}
                disabled={i === ingredients.length - 1}
              >
                ▼
              </IconButton>
            </div>
            <TextInput
              type="text"
              value={ing.quantity}
              onChange={e => actions.update(ing._id, 'quantity', e.target.value)}
              placeholder={t('qtyPlaceholder')}
              size="sm"
              fullWidth={false}
              className="w-16"
            />
            <UnitSelect
              unitKey={ing.unitKey}
              unit={ing.unit}
              onChange={({ unitKey, unit }) => {
                actions.update(ing._id, 'unitKey', unitKey);
                actions.update(ing._id, 'unit', unit);
              }}
              customPlaceholder={t('customUnitPlaceholder')}
              customLabel={t('customUnitLabel')}
              ariaLabel={t('unitAriaLabel')}
            />
            <TextInput
              type="text"
              value={ing.name}
              onChange={(e) => {
                actions.update(ing._id, 'name', e.target.value);
                if (e.target.value.trim()) onClearError?.(ing._id);
              }}
              placeholder={t('ingredientPlaceholder')}
              size="sm"
              fullWidth={false}
              className="flex-1 min-w-0"
              error={ingredientErrors?.has(ing._id)}
            />
            <RemoveButton onClick={() => actions.remove(ing._id)} label={t('removeIngredient')} />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => actions.append(emptyIngredient)}
        className="mt-2 w-full flex items-center gap-2 py-1 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400 transition-colors group"
      >
        <span className="flex-1 border-t border-dashed border-stone-200 dark:border-stone-700 group-hover:border-stone-400 dark:group-hover:border-stone-500 transition-colors" />
        <span>{t('addIngredient')}</span>
        <span className="flex-1 border-t border-dashed border-stone-200 dark:border-stone-700 group-hover:border-stone-400 dark:group-hover:border-stone-500 transition-colors" />
      </button>
    </div>
  );
};
