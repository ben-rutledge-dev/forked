'use client';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
// Data
import { usePostMealPlan } from '@/data/meal-plans';
import type { SavedRecipe } from '@/data/meal-plans';
import { useMealPlan } from '@/data/meal-plans/[mealPlanId]';
import { usePostEntry, usePutEntriesReorder } from '@/data/meal-plans/[mealPlanId]/entries';
import { useDeleteEntry, usePatchEntry } from '@/data/meal-plans/[mealPlanId]/entries/[entryId]';
import { usePostMealPlanInvite } from '@/data/meal-plans/[mealPlanId]/invites';
import { useDeleteMealPlanMember } from '@/data/meal-plans/[mealPlanId]/members/[memberId]';
import { usePostSlot, usePutSlotsReorder } from '@/data/meal-plans/[mealPlanId]/slots';
import { useDeleteSlot } from '@/data/meal-plans/[mealPlanId]/slots/[slotId]';
import type { MealPlanDetail, MealPlanEntry, MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';
import { queryKeys } from '@/data/queryKeys';
import { useQueryClient } from '@/data/shared/hooks';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
import { useModal } from '@/hooks/useModal';
// Components
import { AddRecipeModal } from './components/AddRecipeModal';
import { AddSlotModal } from './components/AddSlotModal';
import { EntryCardGhost } from './components/EntryCard';
import { MobileView } from './components/MobileView';
import { WeekGrid } from './components/WeekGrid';
import { Button } from '@/components/Button';
import { InviteModal, type InviteModalProps } from '@/components/Invites';
import { MembersSection } from '@/components/MembersSection';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { Toast } from '@/components/Toast';
import { UserBadge } from '@/components/UserBadge';
// Utils
import { formatDateStrLabel } from '@/utils/dates';

// All date helpers work on YYYY-MM-DD strings using UTC arithmetic to avoid
// local-timezone offset errors when Date.toISOString() converts to UTC.
export const addDays = (dateStr: string, days: number): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const result = new Date(Date.UTC(y, m - 1, d + days));
  return result.toISOString().split('T')[0];
};

export const startOfWeek = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dow = date.getUTCDay(); // 0 = Sunday
  const diff = dow === 0 ? -6 : 1 - dow; // shift to Monday
  return addDays(dateStr, diff);
};

const todayStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
};

// Where a dragged slot would land. `end` is a dedicated target for the trailing
// add-slot cell so dropping past the last column lands cleanly at the very end.
export type SlotDropTarget
  = | { type: 'slot', slotId: string, side: 'left' | 'right' }
    | { type: 'start' }
    | { type: 'end' }
    | null;

type Props = {
  planId: string | null
  isPremium: boolean
  currentUserId: string
  initialData: MealPlanDetail | null
  initialStartDate: string | null
};

export const MealPlannerClient = ({ planId, isPremium, currentUserId, initialData, initialStartDate }: Props) => {
  const t = useTranslations('mealPlanner');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const { modal } = useModal();

  const today = todayStr();
  const [currentStartDate, setCurrentStartDate] = useState<string>(
    initialStartDate ?? (isPremium ? startOfWeek(today) : today),
  );
  const endDate = addDays(currentStartDate, 6);

  const [toast, setToast] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Entry drag feedback: which entry has a position bar and where; which slot is highlighted
  const [overEntryId, setOverEntryId] = useState<string | null>(null);
  const [overEntrySide, setOverEntrySide] = useState<'before' | 'after' | null>(null);
  const [overSlotKey, setOverSlotKey] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'entry' | 'slot' | null>(null);
  const [dropTarget, setDropTarget] = useState<SlotDropTarget>(null);

  // Mount exactly one of the desktop grid / mobile day view. Rendering both
  // registers duplicate dnd-kit sortable ids, which corrupts drag overlay
  // positioning and sizing. Default to desktop for SSR, correct on mount.
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { data: plan } = useMealPlan(
    planId
      ? { mealPlanId: planId, startDate: currentStartDate, endDate }
      : undefined,
  );

  // Keep slots/members/title from whichever plan snapshot we have.
  // Entries are week-specific: only use them if plan data is for the current week.
  const planMeta = plan ?? initialData;
  const weekEntries: MealPlanEntry[] = plan?.entries
    ?? (currentStartDate === initialStartDate ? (initialData?.entries ?? []) : []);

  const { mutateAsync: createPlan, isPending: isCreating } = usePostMealPlan();
  const { mutateAsync: postSlot } = usePostSlot({ mealPlanId: planId ?? '' });
  const { mutateAsync: reorderSlots } = usePutSlotsReorder({ mealPlanId: planId ?? '' });
  const { mutateAsync: deleteSlot } = useDeleteSlot({ mealPlanId: planId ?? '' });
  const { mutateAsync: postEntry } = usePostEntry({ mealPlanId: planId ?? '', startDate: currentStartDate });
  const { mutate: reorderEntries } = usePutEntriesReorder({ mealPlanId: planId ?? '', startDate: currentStartDate });
  const { mutateAsync: deleteEntry } = useDeleteEntry({ mealPlanId: planId ?? '', startDate: currentStartDate });
  const { mutate: patchEntry } = usePatchEntry({ mealPlanId: planId ?? '', startDate: currentStartDate });
  const { mutateAsync: invite } = usePostMealPlanInvite({ mealPlanId: planId ?? '' });
  const { mutateAsync: deleteMember } = useDeleteMealPlanMember({ mealPlanId: planId ?? '' });

  const slots: MealPlanSlot[] = planMeta?.slots ?? [];
  const sortedSlots = [...slots].sort((a, b) => a.orderIndex - b.orderIndex);
  const isOwner = planMeta?.currentUserRole === 'OWNER';
  const canEdit = planMeta?.currentUserRole !== 'VIEWER';

  const isPastWeek = currentStartDate < startOfWeek(today);
  // Slots are plan-level (they apply to every day/week), so editing them is
  // allowed on any week the user has edit rights for. Recipe entries are
  // week-specific, so they're locked when viewing a past week.
  const canEditSlots = canEdit;
  const canEditEntries = canEdit && !isPastWeek;

  // Premium: 8 weeks forward from start of current week.
  // Free: always anchored to today, next button permanently disabled (shown with upgrade hint).
  const maxNextStartDate = isPremium
    ? addDays(startOfWeek(today), 7 * 8 - 7)
    : addDays(today, -1); // ensures canGoNext is always false for free users
  const canGoNext = isPremium && currentStartDate < maxNextStartDate;

  // Allow going back to the week the plan was created, not just to current week.
  const planCreatedWeekStart = initialData?.createdAt
    ? startOfWeek(initialData.createdAt.split('T')[0])
    : startOfWeek(today);
  const canGoPrev = isPremium && currentStartDate > planCreatedWeekStart;

  const handlePrev = () => {
    if (!canGoPrev) return;
    // currentStartDate is always a Monday; just subtract 7 days.
    setCurrentStartDate(d => addDays(d, -7));
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setCurrentStartDate(d => addDays(d, 7));
  };

  const invalidateWeek = useCallback(() => {
    if (!planId) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.week(planId, currentStartDate) });
  }, [queryClient, planId, currentStartDate]);

  // Optimistically patch the cached week data so reorders persist immediately
  // (before the server confirms) instead of snapping back to the old order.
  const optimisticPatch = useCallback((patch: (d: MealPlanDetail) => MealPlanDetail) => {
    if (!planId) return;
    queryClient.setQueryData<MealPlanDetail>(
      queryKeys.mealPlans.week(planId, currentStartDate),
      old => (old ? patch(old) : old),
    );
  }, [queryClient, planId, currentStartDate]);

  const handleCreate = async () => {
    await createPlan({});
    router.refresh();
  };

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
    const dayLabel = formatDateStrLabel(date);

    const recipe = await modal<SavedRecipe | null, React.ComponentProps<typeof AddRecipeModal>>({
      Component: AddRecipeModal,
      props: { slotLabel, dayLabel },
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

  const handleInvite = async () => {
    const result = await modal<true | null, InviteModalProps<'COLLABORATOR' | 'VIEWER'>>({
      Component: InviteModal,
      props: {
        heading: t('inviteCollaborator'),
        roles: [
          { value: 'COLLABORATOR' as const, label: 'Collaborator' },
          { value: 'VIEWER' as const, label: 'Viewer' },
        ],
        defaultRole: 'COLLABORATOR' as const,
        onSubmit: async (username: string, role: 'COLLABORATOR' | 'VIEWER') => {
          await invite({ username, role });
        },
      },
      maxWidth: 'max-w-sm',
      cancelValue: null,
    });
    if (!result) return;
    setToast('Invited!');
  };

  const handleRemoveMember = async (userId: string) => {
    if (!await confirm('Remove this member?', { confirmLabel: 'Remove' })) return;
    await deleteMember({ userId });
  };

  // ── Drag and drop ──────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // pointerWithin checks which droppable physically contains the cursor.
  // closestCenter (the dnd-kit default) uses overlay-center distances — but
  // verticalListSortingStrategy shifts entries' DOM rects downward during an
  // active drag, so the strategy can move a Tuesday entry's rect into
  // Wednesday's row and closestCenter picks it up instead of Wednesday's cell.
  // pointerWithin is immune to that because it uses the raw pointer position.
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const within = pointerWithin(args);
      return within.length > 0 ? within : closestCenter(args);
    },
    [],
  );

  const activeEntry = activeType === 'entry'
    ? weekEntries.find(e => e.id === activeId) ?? null
    : null;
  const activeSlot = activeType === 'slot'
    ? sortedSlots.find(s => `slot-${s.id}` === activeId) ?? null
    : null;

  const resetDrag = () => {
    setActiveId(null);
    setActiveType(null);
    setDropTarget(null);
    setOverEntryId(null);
    setOverEntrySide(null);
    setOverSlotKey(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    const type = event.active.data.current?.type as 'entry' | 'slot' | undefined;
    setActiveId(id);
    setActiveType(type ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const activeType = active.data.current?.type;

    // ── Slot drag: update column drop-indicator bar ──
    if (activeType === 'slot') {
      const overType = over?.data.current?.type;
      if (overType === 'slot-start') {
        setDropTarget({ type: 'start' });
        return;
      }
      if (overType === 'slot-end') {
        setDropTarget({ type: 'end' });
        return;
      }
      if (!over || overType !== 'slot') {
        setDropTarget(null);
        return;
      }
      const srcIdx = sortedSlots.findIndex(s => `slot-${s.id}` === String(active.id));
      const ovIdx = sortedSlots.findIndex(s => `slot-${s.id}` === String(over.id));
      setDropTarget({
        type: 'slot',
        slotId: String(over.id).replace('slot-', ''),
        side: srcIdx < ovIdx ? 'right' : 'left',
      });
      return;
    }

    // ── Entry drag: update position bar + slot highlight ──
    if (activeType === 'entry') {
      if (!over) {
        setOverEntryId(null);
        setOverEntrySide(null);
        setOverSlotKey(null);
        return;
      }
      const overType = over.data.current?.type as string;
      const activeSlotId = active.data.current?.slotId as string;
      const activeDate = active.data.current?.date as string;
      const overSlotId = over.data.current?.slotId as string;
      const overDate = over.data.current?.date as string;

      const isSameSlotAndDay = overSlotId === activeSlotId && overDate === activeDate;

      if (overType === 'entry' && String(over.id) !== String(active.id)) {
        // Always show a position bar on the hovered entry.
        // For same-slot reorder: side depends on drag direction.
        // For cross-slot/day: always insert BEFORE the hovered entry (matches handleEntryDrop logic).
        const sorted = weekEntries
          .filter(e => e.slotId === overSlotId && e.date === overDate)
          .sort((a, b) => a.orderIndex - b.orderIndex);
        const srcI = sorted.findIndex(e => e.id === String(active.id));
        const ovI = sorted.findIndex(e => e.id === String(over.id));
        // srcI === -1 when dragging from a different slot; treat as "before"
        setOverEntryId(String(over.id));
        setOverEntrySide(srcI !== -1 && srcI < ovI ? 'after' : 'before');
        // Slot highlight only for cross-slot/day moves
        setOverSlotKey(!isSameSlotAndDay && overSlotId && overDate ? `${overDate}-${overSlotId}` : null);
      }
      else if (overType === 'slot-cell') {
        // Show slot highlight for cross-slot/day moves
        setOverSlotKey(!isSameSlotAndDay && overSlotId && overDate ? `${overDate}-${overSlotId}` : null);
        // Show bar after the last entry in the target slot (insert at end)
        const lastEntry = weekEntries
          .filter(e => e.slotId === overSlotId && e.date === overDate && e.id !== String(active.id))
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .at(-1) ?? null;
        setOverEntryId(lastEntry?.id ?? null);
        setOverEntrySide(lastEntry ? 'after' : null);
      }
      else {
        setOverEntryId(null);
        setOverEntrySide(null);
        setOverSlotKey(null);
      }
    }
  };

  const handleSlotDrop = (activeId: string, overType: string, overId: string) => {
    const oldIdx = sortedSlots.findIndex(s => `slot-${s.id}` === activeId);
    if (oldIdx === -1) return;
    let newIdx: number;
    if (overType === 'slot-start') newIdx = 0;
    else if (overType === 'slot-end') newIdx = sortedSlots.length - 1;
    else newIdx = sortedSlots.findIndex(s => `slot-${s.id}` === overId);
    if (newIdx === -1) return;
    const reordered = arrayMove(sortedSlots, oldIdx, newIdx)
      .map((s, i) => ({ ...s, orderIndex: i }));
    optimisticPatch(d => ({ ...d, slots: reordered }));
    reorderSlots({ slots: reordered.map(s => ({ id: s.id, orderIndex: s.orderIndex })) });
  };

  const handleEntryDrop = (
    activeId: string,
    overId: string,
    activeData: Record<string, unknown>,
    overData: Record<string, unknown>,
  ) => {
    const activeSlotId = activeData.slotId as string;
    const activeDate = activeData.date as string;
    const overType = overData.type as string;
    const targetSlotId = overData.slotId as string;
    const targetDate = overData.date as string;

    const isSameSlotAndDay = activeSlotId === targetSlotId && activeDate === targetDate;

    if (isSameSlotAndDay && overType === 'entry') {
      // Same slot, same day: reorder within the slot
      const slotEntries = weekEntries
        .filter(e => e.slotId === activeSlotId && e.date === activeDate)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      const oldIdx = slotEntries.findIndex(e => e.id === activeId);
      const newIdx = slotEntries.findIndex(e => e.id === overId);
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(slotEntries, oldIdx, newIdx)
        .map((e, i) => ({ ...e, orderIndex: i }));
      const byId = new Map(reordered.map(e => [e.id, e]));
      optimisticPatch(d => ({ ...d, entries: d.entries.map(e => byId.get(e.id) ?? e) }));
      reorderEntries({ entries: reordered.map(e => ({ id: e.id, orderIndex: e.orderIndex })) });
      return;
    }

    // Different slot or different day: move the entry
    const movedEntry = weekEntries.find(e => e.id === activeId);
    if (!movedEntry) return;

    // Build the new ordered list for the target slot+day, excluding the moving entry
    const targetEntries = weekEntries
      .filter(e => e.slotId === targetSlotId && e.date === targetDate && e.id !== activeId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const insertAt = overType === 'entry'
      ? Math.max(0, targetEntries.findIndex(e => e.id === overId))
      : targetEntries.length;

    const newTargetEntries = [
      ...targetEntries.slice(0, insertAt),
      { ...movedEntry, slotId: targetSlotId, date: targetDate },
      ...targetEntries.slice(insertAt),
    ].map((e, i) => ({ ...e, orderIndex: i }));

    const byId = new Map(newTargetEntries.map(e => [e.id, e]));
    optimisticPatch(d => ({
      ...d,
      entries: [
        ...d.entries.filter(e => !(e.slotId === targetSlotId && e.date === targetDate) && e.id !== activeId),
        ...newTargetEntries,
      ],
    }));

    const newOrderIndex = byId.get(activeId)?.orderIndex ?? insertAt;
    patchEntry({ entryId: activeId, slotId: targetSlotId, date: targetDate, orderIndex: newOrderIndex });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    resetDrag();
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;
    if (activeType === 'slot') {
      if (overType === 'slot' || overType === 'slot-start' || overType === 'slot-end') {
        handleSlotDrop(String(active.id), overType, String(over.id));
      }
    }
    else if (activeType === 'entry' && (overType === 'entry' || overType === 'slot-cell')) {
      handleEntryDrop(String(active.id), String(over.id), active.data.current ?? {}, over.data.current ?? {});
    }
  };

  // ── Empty state ────────────────────────────────────────────────────────────

  if (!planId) {
    return (
      <PageLayout>
        <PageHeader title={t('heading')} />
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <p className="text-xl font-semibold text-stone-800">{t('emptyTitle')}</p>
          <p className="text-stone-400 text-sm">{t('emptySubtext')}</p>
          <Button
            variant="primary"
            size="md"
            shape="pill"
            disabled={isCreating}
            onClick={handleCreate}
          >
            {isCreating ? t('creating') : t('createPlan')}
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      <PageHeader
        title={planMeta?.title ?? t('heading')}
        action={(
          <div className="flex items-center gap-2">
            {planMeta?.currentUserRole && (
              <UserBadge role={planMeta.currentUserRole} />
            )}
            {isOwner && (
              isPremium
                ? (
                    <Button variant="secondary" size="sm" shape="pill" onClick={handleInvite}>
                      {t('invite')}
                    </Button>
                  )
                : (
                    <span className="text-xs text-stone-400">{t('upgradeToInvite')}</span>
                  )
            )}
          </div>
        )}
      />

      {isPastWeek && (
        <div className="mb-4 rounded-lg bg-stone-100 px-4 py-2 text-sm text-stone-500">
          {t('pastWeekBanner')}
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center gap-2 mb-6">
        {isPremium && (
          <Button
            variant="secondary"
            size="sm"
            shape="pill"
            disabled={!canGoPrev}
            onClick={handlePrev}
          >
            {t('prevWeek')}
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          shape="pill"
          disabled={!canGoNext}
          onClick={handleNext}
        >
          {t('nextWeek')}
        </Button>
        {!isPremium && (
          <span className="text-xs text-stone-400 ml-1">{t('upgradeToNavigate')}</span>
        )}
      </div>

      <DndContext
        id="meal-planner"
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={resetDrag}
      >
        {isDesktop
          ? (
              // Desktop: days as rows, slots as columns
              <WeekGrid
                startDate={currentStartDate}
                slots={sortedSlots}
                entries={weekEntries}
                canEditSlots={canEditSlots}
                canEditEntries={canEditEntries}
                dropTarget={dropTarget}
                overEntryId={overEntryId}
                overEntrySide={overEntrySide}
                overSlotKey={overSlotKey}
                onAddRecipe={handleAddRecipe}
                onRemoveEntry={handleRemoveEntry}
                onAddSlotAt={handleAddSlotAt}
                onDeleteSlot={handleDeleteSlot}
              />
            )
          : (
              // Mobile: single day view
              <MobileView
                startDate={currentStartDate}
                slots={sortedSlots}
                entries={weekEntries}
                canEditSlots={canEditSlots}
                canEditEntries={canEditEntries}
                overEntryId={overEntryId}
                overEntrySide={overEntrySide}
                overSlotKey={overSlotKey}
                onAddRecipe={handleAddRecipe}
                onRemoveEntry={handleRemoveEntry}
                onAddSlot={() => handleAddSlotAt(sortedSlots.length)}
              />
            )}

        <DragOverlay dropAnimation={null}>
          {activeEntry && <EntryCardGhost entry={activeEntry} />}
          {activeSlot && (
            <div className="px-2 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wide truncate opacity-60">
              {activeSlot.label}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {planMeta && (
        <MembersSection
          members={planMeta.members}
          isOwner={isOwner}
          currentUserId={currentUserId}
          onInvite={isOwner && isPremium ? handleInvite : undefined}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </PageLayout>
  );
};
