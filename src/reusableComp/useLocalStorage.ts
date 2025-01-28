import { useState } from "react";

export const useLocalStorage = <T>(storageKey: string, fallbackState: T) => {
  const stored = localStorage.getItem(storageKey);
  const [value, setValue] = useState<T>(
    stored ? JSON.parse(stored) : fallbackState
  );
  const setValueWithLocalStorage = (newValue: React.SetStateAction<T>) => {
    setValue(newValue);
    const valueToStore =
      typeof newValue === "function"
        ? (newValue as (prevState: T) => T)(value)
        : newValue;
    localStorage.setItem(storageKey, JSON.stringify(valueToStore));
  };
  return [value, setValueWithLocalStorage] as const;
};
