import { useCallback } from 'react';

type WithId = { _id: string };

type ListFieldActions<T extends WithId> = {
  update: (id: string, field: keyof Omit<T, '_id'>, value: string) => void
  remove: (id: string) => void
  move: (id: string, dir: -1 | 1) => void
  insert: (afterId: string, empty: () => T) => void
  append: (empty: () => T) => void
};

export const useListField = <T extends WithId>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
): ListFieldActions<T> => {
  const update = useCallback(
    (id: string, field: keyof Omit<T, '_id'>, value: string) => {
      setter(prev =>
        prev.map(item => (item._id === id ? { ...item, [field]: value } : item)),
      );
    },
    [setter],
  );

  const remove = useCallback(
    (id: string) => {
      setter(prev => prev.filter(item => item._id !== id));
    },
    [setter],
  );

  const move = useCallback(
    (id: string, dir: -1 | 1) => {
      setter((prev) => {
        const i = prev.findIndex(item => item._id === id);
        if (i === -1) return prev;
        const next = [...prev];
        [next[i], next[i + dir]] = [next[i + dir], next[i]];
        return next;
      });
    },
    [setter],
  );

  const insert = useCallback(
    (afterId: string, empty: () => T) => {
      setter((prev) => {
        const i = prev.findIndex(item => item._id === afterId);
        if (i === -1) return prev;
        const next = [...prev];
        next.splice(i + 1, 0, empty());
        return next;
      });
    },
    [setter],
  );

  const append = useCallback(
    (empty: () => T) => {
      setter(prev => [...prev, empty()]);
    },
    [setter],
  );

  return { update, remove, move, insert, append };
};
