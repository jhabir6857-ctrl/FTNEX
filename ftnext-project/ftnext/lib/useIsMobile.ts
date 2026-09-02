'use client';

import { useEffect, useState } from 'react';

/**
 * Breakpoint check for hero variant selection. Spec Section 6, "Mobile":
 * "render mobile variant below 768px (Tailwind `md`)."
 *
 * Starts `false` (desktop) to match server render and avoid hydration
 * mismatch; flips after mount once `window` is available.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    setIsMobile(query.matches);

    const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
