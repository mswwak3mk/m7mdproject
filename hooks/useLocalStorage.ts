// Fix: Import React to resolve 'Cannot find namespace React' error for type annotations.
import React, { useState, useEffect } from 'react';

function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
            try {
                if(e.newValue) {
                    setStoredValue(JSON.parse(e.newValue));
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);
  
  // By returning `setStoredValue` directly from `useState`, we ensure that
  // functional updates (e.g., `setData(prev => ...)`) receive the latest state,
  // fixing the stale state bug.
  return [storedValue, setStoredValue];
}

export default useLocalStorage;
