'use client';

import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
// Data
import { usePendingMealPlanInvites, usePostMealPlan } from '@/data/meal-plans';
import { useMealPlan } from '@/data/meal-plans/[mealPlanId]';
import { usePostEntry, usePutEntriesReorder } from '@/data/meal-plans/[mealPlanId]/entries';
import { useDeleteEntry, usePatchEntry } from '@/data/meal-plans/[mealPlanId]/entries/[entryId]';
import { usePostSlot, usePutSlotsReorder } from '@/data/meal-plans/[mealPlanId]/slots';
import { useDeleteSlot } from '@/data/meal-plans/[mealPlanId]/slots/[slotId]';
import type { MealPlanDetail, MealPlanEntry, MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';
import { queryKeys } from '@/data/queryKeys';
import { useQueryClient } from '@/data/shared/hooks';
// Components
import { EntryCardGhost } from './components/EntryCard';
import { MobileView } from './components/MobileView';
import { PlanInvitesSection } from './components/PlanInvitesSection';
import { PlanMembersPanel } from './components/PlanMembersPanel';
import { WeekGrid } from './components/WeekGrid';
import { Button } from '@/components/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { Toast } from '@/components/Toast';
import { UserBadge } from '@/components/UserBadge';
// Utils
import { addDays, formatWeekRange, startOfWeek, todayStr } from '@/utils/dates';
import { usePlannerActions } from './hooks/usePlannerActions';
import { usePlannerDnd } from './hooks/usePlannerDnd';

type MealPlannerClientProps = {
  planId: string | null
  isPremium: boolean
  currentUserId: string
  initialData: MealPlanDetail | null
  initialStartDate: string | null
};

export const MealPlannerClient: React.FC<MealPlannerClientProps> = (props) => {
  const {
    planId,
    isPremium,
    currentUserId,
    initialData,
    initialStartDate,
  } = props;

  const t = useTranslations('mealPlanner');
  const router = useRouter();
  const queryClient = useQueryClient();

  const today = todayStr();
  const [currentStartDate, setCurrentStartDate] = useState<string>(
    initialStartDate ?? (isPremium ? startOfWeek(today) : today),
  );
  const endDate = addDays(currentStartDate, 6);

  const [toast, setToast] = useState<string | null>(null);

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

  const { data: pendingData } = usePendingMealPlanInvites();
  const pending = pendingData?.pending ?? [];

  const { mutateAsync: createPlan, isPending: isCreating } = usePostMealPlan();
  const { mutateAsync: postSlot } = usePostSlot({ mealPlanId: planId ?? '' });
  const { mutateAsync: reorderSlots } = usePutSlotsReorder({ mealPlanId: planId ?? '' });
  const { mutateAsync: deleteSlot } = useDeleteSlot({ mealPlanId: planId ?? '' });
  const { mutateAsync: postEntry } = usePostEntry({ mealPlanId: planId ?? '', startDate: currentStartDate });
  const { mutate: reorderEntries } = usePutEntriesReorder({ mealPlanId: planId ?? '', startDate: currentStartDate });
  const { mutateAsync: deleteEntry } = useDeleteEntry({ mealPlanId: planId ?? '', startDate: currentStartDate });
  const { mutate: patchEntry } = usePatchEntry({ mealPlanId: planId ?? '', startDate: currentStartDate });

  const slots: MealPlanSlot[] = planMeta?.slots ?? [];
  const sortedSlots = [...slots].sort((a, b) => a.orderIndex - b.orderIndex);
  const isOwner = planMeta?.currentUserRole === 'OWNER';
  const canEdit = planMeta?.currentUserRole !== 'VIEWER';

  const isPastWeek = currentStartDate < startOfWeek(today);
  // Slots are plan-level so editing them is allowed on any week with edit rights.
  // Recipe entries are week-specific so they're locked when viewing a past week.
  const canEditSlots = canEdit;
  const canEditEntries = canEdit && !isPastWeek;

  // Premium: 8 weeks forward from start of current week.
  // Free: always anchored to today, next button permanently disabled (shown with upgrade hint).
  const maxNextStartDate = isPremium
    ? addDays(startOfWeek(today), 7 * 8 - 7)
    : addDays(today, -1);
  const canGoNext = isPremium && currentStartDate < maxNextStartDate;

  // Allow going back to the week the plan was created, not just to current week.
  const planCreatedWeekStart = initialData?.createdAt
    ? startOfWeek(initialData.createdAt.split('T')[0])
    : startOfWeek(today);
  const canGoPrev = isPremium && currentStartDate > planCreatedWeekStart;

  const handlePrev = () => {
    if (!canGoPrev) return;
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

  const {
    sensors,
    collisionDetection,
    activeEntry,
    activeSlot,
    dropTarget,
    overEntryId,
    overEntrySide,
    overSlotKey,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    resetDrag,
  } = usePlannerDnd({
    weekEntries,
    sortedSlots,
    optimisticPatch,
    reorderEntries,
    reorderSlots,
    patchEntry,
  });

  const {
    handleAddSlotAt,
    handleDeleteSlot,
    handleAddRecipe,
    handleRemoveEntry,
  } = usePlannerActions({
    slots,
    postSlot,
    reorderSlots,
    deleteSlot,
    postEntry,
    deleteEntry,
    invalidateWeek,
  });

  return (
    <PageLayout>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      <PageHeader
        title={planMeta?.title ?? t('heading')}
        action={planMeta?.currentUserRole
          ? <UserBadge role={planMeta.currentUserRole} />
          : undefined}
      />

      <PlanInvitesSection pending={pending} onToast={setToast} className="mb-6" />

      {!planId && (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <p className="text-xl font-semibold text-stone-800">{t('emptyTitle')}</p>
          <p className="text-stone-400 text-sm">{t('emptySubtext')}</p>
          <Button
            variant="primary"
            size="md"
            disabled={isCreating}
            onClick={handleCreate}
          >
            {isCreating ? t('creating') : t('createPlan')}
          </Button>
        </div>
      )}

      {planId && (
        <>
          {/* Week navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              disabled={!canGoPrev}
              onClick={handlePrev}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              {t('prevWeek')}
            </Button>

            <div className="relative text-center">
              <div className="text-sm font-medium text-stone-600">
                {formatWeekRange(currentStartDate, endDate)}
              </div>
              <div className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs mt-0.5 z-10 ${isPastWeek || !isPremium ? 'text-stone-400' : 'invisible'}`}>
                {isPastWeek ? t('pastWeekBanner') : t('upgradeToNavigate')}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={!canGoNext}
              onClick={handleNext}
            >
              {t('nextWeek')}
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
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
            <PlanMembersPanel
              planId={planId}
              members={planMeta.members}
              isOwner={isOwner}
              isPremium={isPremium}
              currentUserId={currentUserId}
              onToast={setToast}
            />
          )}
        </>
      )}
    </PageLayout>
  );
};
