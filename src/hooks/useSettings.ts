import { useState, useEffect } from 'react';

export function useSettings<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return defaultValue;
      return JSON.parse(saved) as T;
    } catch {
      // Corrupted value in localStorage — remove it and fall back to default
      localStorage.removeItem(key);
      return defaultValue;
    }
  });

  useEffect(() => {
    const handleStorageChange = (e: any) => {
      if (e.detail?.key === key) {
        setValue(e.detail.value);
      }
    };

    // Listen to custom event for same-tab updates
    window.addEventListener('settings-updated', handleStorageChange);

    return () => {
      window.removeEventListener('settings-updated', handleStorageChange);
    };
  }, [key]);

  // Support both direct values and functional updates (matching React.Dispatch<SetStateAction<T>>)
  const updateValue = (newValueOrUpdater: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved =
        typeof newValueOrUpdater === 'function'
          ? (newValueOrUpdater as (prev: T) => T)(prev)
          : newValueOrUpdater;

      try {
        localStorage.setItem(key, JSON.stringify(resolved));
        window.dispatchEvent(
          new CustomEvent('settings-updated', { detail: { key, value: resolved } })
        );
      } catch {
        // localStorage write failed (e.g. quota exceeded) — skip silently
      }

      return resolved;
    });
  };

  return [value, updateValue] as const;
}
