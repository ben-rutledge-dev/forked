import { createContext } from 'react';

export type DragOverState = {
  overId: string | null
  activeType: string | null
  dropSide: 'top' | 'bottom' | null
};

export const DragOverContext = createContext<DragOverState>({
  overId: null,
  activeType: null,
  dropSide: null,
});
