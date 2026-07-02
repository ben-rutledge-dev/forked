import { useTranslations } from 'next-intl';
import React from 'react';
// Data
import type { SavedRecipe } from '@/data/meal-plans';
import type { MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
import { useModal } from '@/hooks/useModal';
// App
import { AddRecipeModal } from '@/app/meal-planner/components/MealPlannerClient/components/AddRecipeModal';
import { AddSlotModal } from '@/app/meal-planner/components/MealPlannerClient/components/AddSlotModal';
// Utils
import { formatDateStrLabel } from '@/utils/dates';

type Params = {
  slots: MealPlanSlot[]
  postSlot: (args: { label: string }) => Promise<MealPlanSlot>
  reorderSlots: (args: { slots: { id: string, orderIndex: number }[] }) => Promise<unknown>
  deleteSlot: (args: { slotId: string }) => Promise<unknown>
  postEntry: (args: { slotId: string, recipeId: string, date: string }) => Promise<unknown>
  deleteEntry: (args: { entryId: string }) => Promise<unknown>
  invalidateWeek: () => void
};

export const usePlannerActions = ({
  slots,
  postSlot,
  reorderSlots,
  deleteSlot,
  postEntry,
  deleteEntry,
  invalidateWeek,
}: Params) => {
  const t = useTranslations('mealPlanner');
  const { confirm } = useConfirm();
  const { modal } = useModal();

  // Add a slot at a specific position. The slot is created (lands at the end),
  // then the full slot order is rewritten so it sits at `targetIndex`.
  const handleAddSlotAt = async (targetIndex: number) => {
    const label = await modal<string | null, React.ComponentProps<typeof AddSlotModal>>({
      Component: AddSlotModal,
      props: {},
      maxWidth: 'max-w-sm',
      cancelValue: null,
    });
    if (!label) return;

    const created = await postSlot({ label });
    const ordered = [...slots].sort((a, b) => a.orderIndex - b.orderIndex);
    ordered.splice(targetIndex, 0, created);
    await reorderSlots({ slots: ordered.map((s, i) => ({ id: s.id, orderIndex: i })) });
    invalidateWeek();
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!await confirm(t('confirmDeleteSlot'), { confirmLabel: t('deleteSlot') })) return;
    await deleteSlot({ slotId });
    invalidateWeek();
  };

  const handleAddRecipe = async (slotId: string, slotLabel: string, date: string) => {
    const recipe = await modal<SavedRecipe | null, React.ComponentProps<typeof AddRecipeModal>>({
      Component: AddRecipeModal,
      props: { slotLabel, dayLabel: formatDateStrLabel(date) },
      maxWidth: 'max-w-md',
      cancelValue: null,
    });
    if (!recipe) return;
    await postEntry({ slotId, recipeId: recipe.id, date });
    invalidateWeek();
  };

  const handleRemoveEntry = async (entryId: string) => {
    if (!await confirm('Remove this recipe from your plan?', { confirmLabel: 'Remove' })) return;
    await deleteEntry({ entryId });
    invalidateWeek();
  };

  return {
    handleAddSlotAt,
    handleDeleteSlot,
    handleAddRecipe,
    handleRemoveEntry,
  };
};
