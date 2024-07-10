import { useState, useRef, useCallback, useEffect } from 'react';

function useDebouncedUpdate(callback: (content: string) => void, delay: number): [string, (newContent: string) => void] {
  const [content, setContent] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdate = useCallback((newContent: string) => {
    setContent(newContent);

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

  return [content, debouncedUpdate];
}

export default useDebouncedUpdate;
