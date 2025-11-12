import React, { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook for persisting state to localStorage.
 * This version is enhanced to be more robust against stale state issues
 * by wrapping the update logic within a useCallback and using the functional
 * form of the state setter.
 *
 * @param key The key to use in localStorage.
 * @param initialValue The initial value to use if no value is found in localStorage.
 * @returns A stateful value, and a function to update it.
 */
function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage", key, error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
    try {
      // We use the functional update form of setState to ensure we always have the latest state.
      setStoredValue(currentValue => {
        // The value can be a new value, or a function that receives the previous state.
        const valueToStore = value instanceof Function ? value(currentValue) : value;
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.error("Error writing to localStorage", key, error);
    }
  }, [key]);

  // Effect to listen for changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) {
        return;
      }
      try {
        if (e.newValue) {
          setStoredValue(JSON.parse(e.newValue));
        } else {
          // The value was removed in another tab, reset to initialValue.
          setStoredValue(initialValue);
        }
      } catch (error) {
        console.error("Error parsing storage change", key, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
