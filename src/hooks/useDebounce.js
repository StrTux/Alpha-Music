import {useState, useEffect, useRef} from 'react';

/**
 * Custom hook that returns a debounced value after the specified delay
 * Useful for preventing excessive renders or API calls when a value changes rapidly
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {any} - The debounced value
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    // Clear the previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a new timer to update the debounced value after the delay
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup on unmount or when value/delay changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Creates a debounced function that delays invoking the provided function
 * until after 'delay' milliseconds have elapsed since the last time it was invoked
 *
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {Function} - The debounced version of the function
 */
export const debounce = (fn, delay = 500) => {
  let timeoutId;

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * Custom hook that provides a debounced state setter
 * Useful for preventing excessive state updates
 *
 * @param {any} initialValue - The initial state value
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {Array} - [value, setValue, debouncedValue] tuple
 */
export const useStateWithDebounce = (initialValue, delay = 500) => {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return [value, setValue, debouncedValue];
};

export default useDebounce;
