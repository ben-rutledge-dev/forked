'use client';

import React, { createContext, useMemo, useReducer } from 'react';
// Store
import { initialState, reducer } from '@/store/reducer';
import type { GlobalAction, GlobalState } from '@/store/reducer';

type GlobalContextType = {
  state: GlobalState
  dispatch: React.Dispatch<GlobalAction>
};

const GlobalContext = createContext<GlobalContextType>({
  state: initialState,
  dispatch: () => undefined,
});

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
