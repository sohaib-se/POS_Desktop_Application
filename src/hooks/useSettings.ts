import { useState, useEffect } from 'react';

export function useSettings(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
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

  const updateValue = (newValue: boolean) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
    // Dispatch custom event so other components in the same window update
    window.dispatchEvent(new CustomEvent('settings-updated', { detail: { key, value: newValue } }));
  };

  return [value, updateValue] as const;
}
