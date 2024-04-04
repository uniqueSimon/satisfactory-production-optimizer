import { useState } from "react";

export const useLocalStorage = <T>(storageKey: string, fallbackState: T) => {
  const stored = localStorage.getItem(storageKey);
  const [value, setValue] = useState<T>(
    stored ? JSON.parse(stored) : fallbackState
  );
  const setValueWithLocalStorage = (value: T) => {
    setValue(value);
    localStorage.setItem(storageKey, JSON.stringify(value));
  };
  return [value, setValueWithLocalStorage] as const;
};
