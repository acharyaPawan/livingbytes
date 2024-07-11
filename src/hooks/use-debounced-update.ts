import { useState, useRef, useCallback, useEffect } from 'react';

function useDebouncedUpdate(callback: (content: string) => void, delay: number): (newContent: string) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdate = useCallback((newContent: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(newContent);
      timeoutRef.current = null;
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedUpdate;
}

export default useDebouncedUpdate;
