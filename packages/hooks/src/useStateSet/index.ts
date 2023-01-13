import { useMemo, useState } from "react";

export interface StateSet<V> extends Set<V> {
  put: (value: V) => void;
  remove: (value: V) => void;
  removeAll: () => void;
}

export const useStateSet = <V>(iterable?: Iterable<V> | null): StateSet<V> => {
  const [stateSet, setStateSet] = useState(new Set(iterable));

  return useMemo(
    () =>
      Object.assign(stateSet, {
        put: (value: V) => {
          setStateSet(prev => {
            if (prev.has(value)) return prev;
            return new Set([...prev, value]);
          });
        },
        remove: (value: V) => {
          setStateSet(prev => {
            const s = new Set(prev);
            s.delete(value);
            return s;
          });
        },
        removeAll: () => setStateSet(new Set())
      }),
    [stateSet]
  );
};
