import type { ReactNode } from 'react';

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full bg-gunmetal text-steel text-xs uppercase tracking-wider">
      {children}
    </span>
  );
}
