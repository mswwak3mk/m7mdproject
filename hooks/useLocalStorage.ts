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
function useLocalStorage<T extends object>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);

        // Ensure parsed data is a non-null object before proceeding
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            console.warn(`LocalStorage data for key "${key}" is not a valid object. Resetting.`);
            window.localStorage.setItem(key, JSON.stringify(initialValue));
            return initialValue;
        }

        const initialKeys = Object.keys(initialValue);
        const parsedKeys = Object.keys(parsed);
        const hasAllKeys = initialKeys.every(k => parsedKeys.includes(k));

        if (hasAllKeys) {
           if (
              !('profile' in parsed) || typeof parsed.profile !== 'object' || parsed.profile === null ||
              !('achievements' in parsed) || !Array.isArray(parsed.achievements) ||
              !('projects' in parsed) || !Array.isArray(parsed.projects) ||
              !('skills' in parsed) || !Array.isArray(parsed.skills) ||
              !('subjects' in parsed) || !Array.isArray(parsed.subjects) ||
              !('comments' in parsed) || !Array.isArray(parsed.comments)
            ) {
                console.warn(`LocalStorage data for key "${key}" has incorrect types. Resetting.`);
                window.localStorage.setItem(key, JSON.stringify(initialValue));
                return initialValue;
            }
          return parsed;
        } else {
            console.warn(`LocalStorage data for key "${key}" is missing keys. Resetting.`);
            window.localStorage.setItem(key, JSON.stringify(initialValue));
            return initialValue;
        }
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading or parsing localStorage for key "${key}"`, error);
      // Attempt to clear corrupted data as a fallback
      try {
        window.localStorage.removeItem(key);
      } catch (removeError) {
        console.error(`Failed to remove corrupted item from localStorage for key "${key}"`, removeError);
      }
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
