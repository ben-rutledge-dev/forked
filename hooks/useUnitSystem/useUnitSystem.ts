'use client';

import { useState } from 'react';
// Utils
import type { UnitSystem } from '@/utils/units';

const KEY = 'forked:unitSystem';

export const useUnitSystem = () => {
  const [system, setSystem] = useState<UnitSystem>(() => {
    if (globalThis.window === undefined) return 'imperial';
    const stored = localStorage.getItem(KEY) as UnitSystem | null;
    return stored === 'metric' || stored === 'imperial' ? stored : 'imperial';
  });

  const toggle = () => {
    setSystem((prev) => {
      const next = prev === 'imperial' ? 'metric' : 'imperial';
      localStorage.setItem(KEY, next);
      return next;
    });
  };

  return { system, toggle };
};
