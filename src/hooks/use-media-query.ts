"use client"

import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>();

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const updateMatches = () => {
      setMatches(mediaQueryList.matches);
    };

    // Initial check
    updateMatches();

    // Add event listener for changes in media query
    const listener = (event: MediaQueryListEvent) => {
      updateMatches();
    };

    mediaQueryList.addListener(listener);

    // Clean up the listener when the component unmounts
    return () => {
      mediaQueryList.removeListener(listener);
    };
  }, [query]);

  return matches as boolean;
};
