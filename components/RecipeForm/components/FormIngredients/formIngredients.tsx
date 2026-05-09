'use client';

// Hooks
import { useListField } from '@/hooks/useListField';
// Components
import { IconButton } from '@/components/IconButton';
import { RemoveButton } from '@/components/RecipeForm/components/RemoveButton';
import { TextInput } from '@/components/TextInput';
import { SectionHeading } from '@/components/Typography';
// Types
import { IngredientFormData } from '@/types';

type IngredientItem = IngredientFormData & { _id: string };

type Props = {
  ingredients: IngredientItem[]
  actions: ReturnType<typeof useListField<IngredientItem>>
  emptyIngredient: () => IngredientItem
};

export const FormIngredients = ({ ingredients, actions, emptyIngredient }: Props) => (
  <div>
    <div className="mb-3">
      <SectionHeading>Ingredients</SectionHeading>
    </div>
    <div className="flex items-center gap-2 mb-1 pl-15 pr-9">
      <span className="w-16 text-xs text-stone-400 font-medium">Qty</span>
      <span className="w-28 text-xs text-stone-400 font-medium">Unit</span>
      <span className="flex-1 text-xs text-stone-400 font-medium">Ingredient</span>
    </div>
    <div className="space-y-2">
      {ingredients.map((ing, i) => (
        <div key={ing._id} className="flex items-center gap-2">
          <div className="flex flex-col gap-1 mr-1">
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
            placeholder="e.g. 2"
            size="sm"
            fullWidth={false}
            className="w-16"
          />
          <TextInput
            type="text"
            value={ing.unit}
            onChange={e => actions.update(ing._id, 'unit', e.target.value)}
            placeholder="e.g. cups"
            size="sm"
            fullWidth={false}
            className="w-28"
          />
          <TextInput
            type="text"
            value={ing.name}
            onChange={e => actions.update(ing._id, 'name', e.target.value)}
            placeholder="e.g. flour"
            size="sm"
            fullWidth={false}
            className="flex-1 min-w-0"
          />
          <RemoveButton onClick={() => actions.remove(ing._id)} label="Remove ingredient" />
        </div>
      ))}
    </div>
    <button
      type="button"
      onClick={() => actions.append(emptyIngredient)}
      className="mt-2 w-full flex items-center gap-2 py-1 text-xs text-stone-400 hover:text-stone-600 transition-colors group"
    >
      <span className="flex-1 border-t border-dashed border-stone-200 group-hover:border-stone-400 transition-colors" />
      <span>+ add ingredient</span>
      <span className="flex-1 border-t border-dashed border-stone-200 group-hover:border-stone-400 transition-colors" />
    </button>
  </div>
);
