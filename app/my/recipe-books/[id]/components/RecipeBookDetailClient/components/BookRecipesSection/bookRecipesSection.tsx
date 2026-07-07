'use client';

import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
// Data
import type { BookEntry } from '@/data/recipe-books/[recipeBookId]/types';
// Hooks
import { useSortableListDnd } from '@/hooks/useSortableListDnd';
// Components
import { Button } from '@/components/Button';
import { RecipeCard } from '@/components/RecipeCard';

type BookRecipesSectionProps = {
  entries: BookEntry[]
  isMember: boolean
  currentUserId: string
  onAddRecipe: () => void
  onRemoveEntry: (entryId: string) => void
  onReorder: (reordered: BookEntry[]) => void
};

export const BookRecipesSection: React.FC<BookRecipesSectionProps> = (props) => {
  const {
    entries,
    isMember,
    currentUserId,
    onAddRecipe,
    onRemoveEntry,
    onReorder,
  } = props;

  const sortedEntries = [...entries].sort((a, b) => a.orderIndex - b.orderIndex);
  const t = useTranslations('recipeBooks');

  const {
    sensors,
    activeItem,
    overId,
    dropSide,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    resetDrag,
  } = useSortableListDnd({
    items: sortedEntries,
    getId: entry => entry.id,
    onReorder,
  });

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('recipesSection')}</h2>
        {isMember && (
          <Button variant="secondary" size="sm" onClick={onAddRecipe}>
            {t('addRecipe')}
          </Button>
        )}
      </div>

      {sortedEntries.length === 0
        ? (
            <p className="text-stone-400 dark:text-stone-500 text-sm py-8 text-center">{t('noRecipes')}</p>
          )
        : (
            <DndContext
              id="book-recipes-dnd"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={resetDrag}
            >
              <SortableContext items={sortedEntries.map(e => e.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedEntries.map(entry => (
                    <BookEntryCard
                      key={entry.id}
                      entry={entry}
                      isMember={isMember}
                      currentUserId={currentUserId}
                      onRemoveEntry={onRemoveEntry}
                      dropSide={overId === entry.id ? dropSide : null}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay dropAnimation={null}>
                {activeItem && (
                  <div className="opacity-60 cursor-grabbing">
                    <RecipeCard
                      id={activeItem.recipe.id}
                      title={activeItem.recipe.title}
                      description={activeItem.recipe.description}
                      coverImageUrl={activeItem.recipe.coverImageUrl}
                      forkCount={activeItem.recipe.forkCount}
                      isPublic={activeItem.recipe.isPublic}
                      isOwned={activeItem.recipe.authorId === currentUserId}
                    />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
    </div>
  );
};

type BookEntryCardProps = {
  entry: BookEntry
  isMember: boolean
  currentUserId: string
  onRemoveEntry: (entryId: string) => void
  dropSide: 'before' | 'after' | null
};

const BookEntryCard: React.FC<BookEntryCardProps> = (props) => {
  const { entry, isMember, currentUserId, onRemoveEntry, dropSide } = props;
  const t = useTranslations('recipeBooks');
  // No transform/transition here — siblings stay put during drag; the drop-indicator
  // bar below is the only "where will this land" preview.
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: entry.id,
    disabled: !isMember,
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative ${isDragging ? 'opacity-25' : ''} ${isMember ? 'touch-none cursor-grab active:cursor-grabbing' : ''}`}
      {...(isMember ? { ...attributes, ...listeners } : {})}
      aria-label={isMember ? t('dragToReorder') : undefined}
    >
      {dropSide === 'before' && (
        <div className="absolute -left-2 inset-y-2 w-0.5 rounded-full bg-primary-400 z-10" />
      )}
      {dropSide === 'after' && (
        <div className="absolute -right-2 inset-y-2 w-0.5 rounded-full bg-primary-400 z-10" />
      )}
      <RecipeCard
        id={entry.recipe.id}
        title={entry.recipe.title}
        description={entry.recipe.description}
        coverImageUrl={entry.recipe.coverImageUrl}
        forkCount={entry.recipe.forkCount}
        isPublic={entry.recipe.isPublic}
        isOwned={entry.recipe.authorId === currentUserId}
        onRemoveFromBook={isMember ? () => onRemoveEntry(entry.id) : undefined}
      />
    </div>
  );
};
