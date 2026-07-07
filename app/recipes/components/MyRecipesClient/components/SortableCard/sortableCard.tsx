'use client';

import { useSortable } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';

type SortableCardProps = {
  id: string
  dropSide?: 'before' | 'after' | null
  children: React.ReactNode
};

export const SortableCard: React.FC<SortableCardProps> = (props) => {
  const { id, dropSide = null, children } = props;
  const t = useTranslations('myRecipes');
  // No transform/transition here — siblings stay put during drag; the drop-indicator
  // bar below is the only "where will this land" preview (avoids the whole grid
  // reflowing/jumping while dragging).
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`relative touch-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-25' : ''}`}
      {...attributes}
      {...listeners}
      aria-label={t('dragToReorder')}
    >
      {dropSide === 'before' && (
        <div className="absolute -left-2 inset-y-2 w-0.5 rounded-full bg-primary-400 z-10" />
      )}
      {dropSide === 'after' && (
        <div className="absolute -right-2 inset-y-2 w-0.5 rounded-full bg-primary-400 z-10" />
      )}
      {children}
    </div>
  );
};
