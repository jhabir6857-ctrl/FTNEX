'use client';

import { useEffect, useState } from 'react';

/**
 * Wraps `prefers-reduced-motion`. Used by the Home page to decide whether to
 * render <ScrollCanvas /> (full scroll-scrubbed hero) or <ReducedMotionHero />
 * (static fallback). See build spec Section 6.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return reduced;
}
