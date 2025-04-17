import {useEffect, useRef, useCallback} from 'react';

/**
 * A custom hook that runs an effect only once on mount
 * @param {Function} effect - The effect function to run
 */
export const useSingleEffect = effect => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;

      // Store the cleanup function if returned
      const cleanup = effect();

      // Return cleanup function
      return () => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // We intentionally want this to run only once on mount
};

/**
 * A custom hook that safely fetches data once on mount
 * @param {Function} fetchFunction - The function to fetch data
 * @param {Array} dependencies - Optional dependencies array
 * @param {Number} throttleMs - Optional throttle time in milliseconds
 */
export const useSafeDataFetching = (
  fetchFunction,
  dependencies = [],
  throttleMs = 0,
) => {
  const hasRun = useRef(false);
  const lastRunTime = useRef(0);
  const abortControllerRef = useRef(null);
  const effectCleanedUp = useRef(false);

  useEffect(() => {
    // Reset the cleanup flag
    effectCleanedUp.current = false;

    // Function to run the fetch
    const runFetch = async () => {
      if (effectCleanedUp.current) {
        return;
      }

      const now = Date.now();
      const timeSinceLastRun = now - lastRunTime.current;

      // Run if never run before, or if throttle time has passed
      if (
        !hasRun.current ||
        (throttleMs > 0 && timeSinceLastRun >= throttleMs)
      ) {
        hasRun.current = true;
        lastRunTime.current = now;

        // Create a new abort controller for this fetch
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          await fetchFunction(controller.signal);
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error in useSafeDataFetching:', error);
          }
        }
      }
    };

    runFetch();

    // Cleanup function
    return () => {
      effectCleanedUp.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
  // We're intentionally using the dependencies parameter directly

  // Provide a reset function
  const reset = useCallback(() => {
    hasRun.current = false;
  }, []);

  return reset;
};

/**
 * A custom hook that throttles data fetching
 * @param {Function} fetchFunction - The function to fetch data
 * @param {Array} dependencies - Dependencies array
 * @param {Number} throttleMs - Throttle time in milliseconds
 */
export const useThrottledDataFetching = (
  fetchFunction,
  dependencies = [],
  throttleMs = 5000,
) => {
  const lastRunTime = useRef(0);
  const abortControllerRef = useRef(null);
  const effectCleanedUp = useRef(false);

  useEffect(() => {
    // Reset the cleanup flag
    effectCleanedUp.current = false;

    // Function to run the fetch
    const runFetch = async () => {
      if (effectCleanedUp.current) {
        return;
      }

      const now = Date.now();
      const timeSinceLastRun = now - lastRunTime.current;

      // Run if throttle time has passed
      if (timeSinceLastRun >= throttleMs) {
        lastRunTime.current = now;

        // Create a new abort controller for this fetch
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          await fetchFunction(controller.signal);
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error in useThrottledDataFetching:', error);
          }
        }
      }
    };

    runFetch();

    // Cleanup function
    return () => {
      effectCleanedUp.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
  // We're intentionally using the dependencies parameter directly

  // Provide a reset function
  const reset = useCallback(() => {
    lastRunTime.current = 0;
  }, []);

  return reset;
};

export default useSingleEffect;
