'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

/**
 * Static fallback rendered instead of <ScrollCanvas /> when the user has
 * `prefers-reduced-motion` set, or as the first working version of the hero
 * before the frame sequence assets exist. See spec Section 6 and 11 (build order).
 *
 * Uses a simple fade-in animation on mount — no scroll-hijacking, no pinning.
 */
export function ReducedMotionHero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!contentRef.current) return;
      gsap.from(contentRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out',
      });
    },
    { scope: contentRef }
  );

  return (
    <section className="relative h-screen w-full flex items-center justify-center bg-onyx">
      <Image
        src="/video/hero-poster.webp"
        alt="FTNEXT — global logistics" // [PLACEHOLDER] confirm final alt copy
        fill
        priority
        className="object-cover opacity-70"
      />
      <div ref={contentRef} className="relative z-10 text-center px-6">
        <h1>[PLACEHOLDER] We Move Your World</h1>
        <p className="mt-4 text-steel max-w-xl mx-auto">
          [PLACEHOLDER] Subhead copy describing FTNEXT&apos;s logistics services.
        </p>
      </div>
    </section>
  );
}
