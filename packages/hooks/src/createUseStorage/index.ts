import { isFunction, isNull, isUndefined, Storage, StorageOption, StorageType } from "@sentimental/toolkit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PACKAGE_NAME } from "../utils";

export interface UseStorageOptions<T> extends Pick<StorageOption, "mode"> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  defaultValue?: T | ((previousState?: T) => T);
  expiration?: number;
}

const name = PACKAGE_NAME.replace(" ", "_");

export const createUseStorage = (type: StorageType) => {
  return <T>(key: string, options?: UseStorageOptions<T>) => {
    const { serializer, deserializer, mode, expiration, defaultValue } = options || {};

    const storage = useMemo(() => {
      return new Storage({ name, type, mode, serializer, deserializer });
    }, [mode, serializer, deserializer]);

    const getStoredValue = useCallback((): T | undefined => {
      const value = storage.getItem(key);
      if (!isNull(value)) return value;
      return isFunction(defaultValue) ? defaultValue() : defaultValue;
    }, [storage, defaultValue]);

    const [state, setState] = useState(() => getStoredValue());

    useEffect(() => {
      setState(getStoredValue());
    }, [key]);

    const updateState = useCallback(
      (value: T | ((previousState?: T) => T)): void => {
        const currentState = isFunction(value) ? value(state) : value;
        setState(currentState);

        if (isUndefined(currentState)) {
          storage.removeItem(key);
        } else {
          storage.setItem(key, currentState, expiration);
        }
      },
      [key, storage, expiration, state]
    );

    return <const>[state, updateState];
  };
};
