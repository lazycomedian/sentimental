import { useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";

export interface StateMap<K, V> extends Map<K, V> {
  put: (key: K, value: V) => void;
  remove: (key: K) => void;
  removeAll: () => void;
}

export const useStateMap = <K, V>(iterable?: Iterable<readonly [K, V]> | null): StateMap<K, V> => {
  const [stateMap, setStateMap] = useState(new Map(iterable));

  const put = useMemoizedFn((key: K, value: V) => {
    setStateMap(prev => new Map([...prev, [key, value]]));
  });

  const remove = useMemoizedFn((key: K) => {
    setStateMap(prev => {
      const m = new Map(prev);
      m.delete(key);
      return m;
    });
  });

  const removeAll = useMemoizedFn(() => setStateMap(new Map()));

  return useMemo(() => Object.assign(stateMap, { put, remove, removeAll }), [stateMap]);
};
