import { useMemo, useState } from "react";

export interface StateMap<K, V> extends Map<K, V> {
  put: (key: K, value: V) => void;
  remove: (key: K) => void;
  removeAll: () => void;
}

export const useStateMap = <K, V>(iterable?: Iterable<readonly [K, V]> | null): StateMap<K, V> => {
  const [stateMap, setStateMap] = useState(new Map(iterable));

  return useMemo(
    () =>
      Object.assign(stateMap, {
        put: (key: K, value: V) => setStateMap(prev => new Map([...prev, [key, value]])),
        remove: (key: K) => {
          setStateMap(prev => {
            const m = new Map(prev);
            m.delete(key);
            return m;
          });
        },
        removeAll: () => setStateMap(new Map())
      }),
    [stateMap]
  );
};
