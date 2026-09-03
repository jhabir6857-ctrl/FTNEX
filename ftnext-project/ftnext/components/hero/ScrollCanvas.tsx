'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  TOTAL_FRAMES,
  PRELOAD_COUNT,
  progressToFrameIndex,
  getFramePath,
} from '@/lib/scrollFrames';

gsap.registerPlugin(ScrollTrigger);

/* ─── Scroll distance ──────────────────────────────────────────────────── */
const SCROLL_LENGTH = '500%'; // 5× viewport height of scroll runway

interface ContentBlock {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly cta?: { readonly label: string; readonly href: string };
  readonly fadeIn: number;
  readonly holdStart: number;
  readonly holdEnd: number;
  readonly fadeOut: number;
}

/* ─── Content block data ───────────────────────────────────────────────── */
const CONTENT_BLOCKS: readonly ContentBlock[] = [
  {
    id: 'aerospace',
    eyebrow: '01',
    title: 'Aerospace Freight',
    description:
      'Rapid air cargo solutions connecting continents with precision-timed deliveries across global aviation corridors.',
    // Visible during scroll progress 0% – 33% (scene 1: Plane)
    fadeIn: 0.03,
    holdStart: 0.06,
    holdEnd: 0.25,
    fadeOut: 0.32,
  },
  {
    id: 'maritime',
    eyebrow: '02',
    title: 'Maritime Cargo',
    description:
      'Deep-sea and coastal vessel operations moving bulk commodities through the world\'s busiest trade lanes.',
    // Visible during scroll progress 33% – 66% (scene 2: Ship)
    fadeIn: 0.36,
    holdStart: 0.40,
    holdEnd: 0.58,
    fadeOut: 0.64,
  },
  {
    id: 'highway',
    eyebrow: '03',
    title: 'Highway Transit',
    description:
      'Last-mile and overland trucking networks ensuring seamless door-to-port and port-to-door delivery.',
    cta: { label: 'Explore Our Services', href: '/services' },
    // Visible during scroll progress 66% – 100% (scene 3: Truck)
    fadeIn: 0.68,
    holdStart: 0.72,
    holdEnd: 0.90,
    fadeOut: 0.97,
  },
];

/**
 * Drone-Tracking Journey — Cinematic scroll-scrubbed hero.
 *
 * CONSTRAINTS (see AGENTS.md):
 * - Uses useGSAP() for all GSAP/ScrollTrigger setup — NOT raw useEffect.
 * - Overlay text animates only `transform` and `opacity`.
 * - The poster image is the intended LCP element — only it gets `priority`.
 *
 * Frame loading strategy:
 * 1. Preload frames 0–24 before enabling scroll playback.
 * 2. Remaining frames 25–179 load progressively via requestIdleCallback.
 * 3. If a frame fails to load, the canvas falls back to the last drawn frame.
 */
export function ScrollCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [ready, setReady] = useState(false);

  // Store loaded images in a ref so they persist across renders
  const framesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  );
  // Track the last successfully drawn frame index for fallback
  const lastDrawnRef = useRef<number>(0);

  /**
   * Draw a specific frame index onto the canvas.
   * Falls back to the last successfully drawn frame if the requested one hasn't loaded.
   */
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Try the requested frame, then the last successfully drawn frame, then frame 0
    const img =
      framesRef.current[frameIndex] ??
      framesRef.current[lastDrawnRef.current] ??
      framesRef.current[0];

    if (!img) return;

    // Match canvas internal resolution to its display size (DPR-aware)
    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (
      canvas.width !== displayWidth * dpr ||
      canvas.height !== displayHeight * dpr
    ) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Draw image covering the canvas (object-fit: cover behavior)
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = displayWidth / displayHeight;
    let sx = 0,
      sy = 0,
      sw = img.naturalWidth,
      sh = img.naturalHeight;

    if (imgRatio > canvasRatio) {
      // Image is wider — crop sides
      sw = img.naturalHeight * canvasRatio;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      // Image is taller — crop top/bottom
      sh = img.naturalWidth / canvasRatio;
      sy = (img.naturalHeight - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, displayWidth, displayHeight);
    lastDrawnRef.current = frameIndex;
  }, []);

  /**
   * Load a single frame image. Returns a promise that resolves with the
   * HTMLImageElement on success, or null on failure (graceful fallback).
   */
  const loadFrame = useCallback(
    (index: number): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        if (framesRef.current[index]) {
          resolve(framesRef.current[index]);
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          framesRef.current[index] = img;
          resolve(img);
        };
        img.onerror = () => {
          console.warn(`[ScrollCanvas] Failed to load frame ${index}`);
          resolve(null);
        };
        img.src = getFramePath(index);
      });
    },
    []
  );

  // Track active ScrollTrigger and animation timelines for explicit unmount cleanup
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const timelinesRef = useRef<gsap.core.Timeline[]>([]);
  const isMountedRef = useRef<boolean>(true);

  useGSAP(
    () => {
      isMountedRef.current = true;
      if (!containerRef.current || !canvasRef.current) return;

      const container = containerRef.current;
      let resizeCleanup: (() => void) | null = null;

      // ── Phase 1: Preload first PRELOAD_COUNT frames ───────────────────
      const preloadPromises: Promise<HTMLImageElement | null>[] = [];
      for (let i = 0; i < PRELOAD_COUNT; i++) {
        preloadPromises.push(loadFrame(i));
      }

      Promise.all(preloadPromises).then(() => {
        // If component unmounted while preloading, abort setup immediately
        if (!isMountedRef.current || !containerRef.current) return;

        setReady(true);

        // Draw the first frame immediately
        drawFrame(0);

        // ── Phase 2: Lazily load remaining frames in background ─────────
        let loadIndex = PRELOAD_COUNT;
        const loadNext = () => {
          if (!isMountedRef.current || loadIndex >= TOTAL_FRAMES) return;
          loadFrame(loadIndex).then(() => {
            loadIndex++;
            if ('requestIdleCallback' in window) {
              (window as Window).requestIdleCallback(loadNext);
            } else {
              setTimeout(loadNext, 16);
            }
          });
        };
        loadNext();

        // ── Phase 3: ScrollTrigger — canvas frame scrub ─────────────────
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: `+=${SCROLL_LENGTH}`,
          pin: true,
          scrub: 0.5, // slight smoothing for silky scrub
          onUpdate: (self) => {
            const frameIndex = progressToFrameIndex(self.progress);
            drawFrame(frameIndex);
          },
        });

        // ── Phase 4: Content block animations ───────────────────────────
        // Each block fades in, holds, then fades out over its scroll segment.
        // Only transform and opacity are animated (per AGENTS.md constraint).
        CONTENT_BLOCKS.forEach((block, i) => {
          const el = blockRefs.current[i];
          if (!el) return;

          // Set initial state: invisible, shifted down
          gsap.set(el, { opacity: 0, y: 40 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: container,
              start: 'top top',
              end: `+=${SCROLL_LENGTH}`,
              scrub: true,
            },
          });

          // Fade in
          tl.to(
            el,
            {
              opacity: 1,
              y: 0,
              duration: block.holdStart - block.fadeIn,
              ease: 'power2.out',
            },
            block.fadeIn
          );

          // Hold (implicit — no animation between holdStart and holdEnd)

          // Fade out
          tl.to(
            el,
            {
              opacity: 0,
              y: -30,
              duration: block.fadeOut - block.holdEnd,
              ease: 'power2.in',
            },
            block.holdEnd
          );

          timelinesRef.current.push(tl);
        });

        // ── Resize handler ──────────────────────────────────────────────
        const handleResize = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const dpr = window.devicePixelRatio || 1;
          canvas.width = canvas.clientWidth * dpr;
          canvas.height = canvas.clientHeight * dpr;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.scale(dpr, dpr);
          drawFrame(lastDrawnRef.current);
        };

        window.addEventListener('resize', handleResize);
        resizeCleanup = () => window.removeEventListener('resize', handleResize);
      });

      // Explicit cleanup returned from useGSAP
      return () => {
        isMountedRef.current = false;
        if (resizeCleanup) {
          resizeCleanup();
        }
        // Kill child timelines
        timelinesRef.current.forEach((tl) => tl.kill());
        timelinesRef.current = [];

        // Kill ScrollTrigger and revert DOM changes (removes .pin-spacer without orphaning)
        if (scrollTriggerRef.current) {
          scrollTriggerRef.current.kill(true);
          scrollTriggerRef.current = null;
        }
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-onyx"
    >
      {/* ── Poster — LCP element ──────────────────────────────────────── */}
      <Image
        src="/video/hero-poster.webp"
        alt="FTNeX — global logistics drone tracking journey"
        fill
        priority
        className={`object-cover transition-opacity duration-700 ${
          ready ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      />

      {/* ── Canvas — scroll-scrubbed frame sequence ───────────────────── */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ── Bottom gradient overlay for text legibility ───────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-onyx/20 to-transparent pointer-events-none" />

      {/* ── Content blocks — 3 segments ───────────────────────────────── */}
      {CONTENT_BLOCKS.map((block, i) => (
        <div
          key={block.id}
          ref={(el) => {
            blockRefs.current[i] = el;
          }}
          className="absolute inset-0 z-10 flex items-end pb-24 md:pb-32 justify-start px-8 md:px-16 lg:px-24 pointer-events-none"
          style={{ opacity: 0 }} // GSAP controls visibility
        >
          <div className="max-w-2xl pointer-events-auto">
            {/* Eyebrow / scene number */}
            <span className="inline-block font-heading text-sm tracking-[0.3em] uppercase text-crimson mb-4 border border-crimson/40 px-3 py-1">
              {block.eyebrow}
            </span>

            {/* Heading */}
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-chrome leading-[1.1] mb-4">
              {block.title.split(' ').map((word, wi) => (
                <span key={wi}>
                  {wi === block.title.split(' ').length - 1 ? (
                    <span className="text-crimson">{word}</span>
                  ) : (
                    <>{word} </>
                  )}
                </span>
              ))}
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg text-steel/90 max-w-lg leading-relaxed mb-6">
              {block.description}
            </p>

            {/* CTA button (only on the last block) */}
            {block.cta && (
              <a
                href={block.cta.href}
                className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-hover text-white font-heading font-medium text-sm tracking-wide uppercase px-8 py-4 transition-colors duration-200"
              >
                {block.cta.label}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            )}

            {/* Crimson accent line */}
            <div className="mt-8 w-16 h-[2px] bg-crimson/60" />
          </div>
        </div>
      ))}

      {/* ── Scroll progress indicator ─────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-steel/50 pointer-events-none">
        <span className="text-xs tracking-widest uppercase font-heading">
          Scroll to explore
        </span>
        <svg
          className="w-5 h-5 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
