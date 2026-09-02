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

/**
 * Core cinematic scroll-scrubbed hero. See build spec Section 6.
 *
 * REQUIRED CONSTRAINTS (do not deviate — see AGENTS.md):
 * - Uses useGSAP() for all GSAP/ScrollTrigger setup — NOT raw useEffect.
 * - Overlay text animates only `transform` and `opacity`. Never animate
 *   top/height/margin in scroll-scrubbed contexts.
 * - The poster image is the intended LCP element — only it gets `priority`.
 *
 * Frame loading strategy:
 * 1. Preload frames 0–24 before enabling scroll playback.
 * 2. Remaining frames 25–179 load progressively in the background.
 * 3. If a frame fails to load, the canvas falls back to the poster/last
 *    successfully loaded frame (per user requirement: no blank hero).
 */
export function ScrollCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Store loaded images in a ref so they persist across renders
  const framesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  );
  // Track the last successfully drawn frame index for fallback
  const lastDrawnRef = useRef<number>(0);

  /**
   * Draw a specific frame index onto the canvas.
   * Falls back to poster (frame 0) if the requested frame hasn't loaded.
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

    // Match canvas internal resolution to its display size
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Draw image covering the canvas (object-fit: cover behavior)
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = displayWidth / displayHeight;
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

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
   * HTMLImageElement on success, or null on failure (no throw — graceful fallback).
   */
  const loadFrame = useCallback((index: number): Promise<HTMLImageElement | null> => {
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
        // Frame load failed — resolve with null; drawFrame will use fallback
        console.warn(`[ScrollCanvas] Failed to load frame ${index}`);
        resolve(null);
      };
      img.src = getFramePath(index);
    });
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || !canvasRef.current) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;
      const headline = headlineRef.current;

      // --- Phase 1: Preload first PRELOAD_COUNT frames ---
      const preloadPromises: Promise<HTMLImageElement | null>[] = [];
      for (let i = 0; i < PRELOAD_COUNT; i++) {
        preloadPromises.push(loadFrame(i));
      }

      Promise.all(preloadPromises).then(() => {
        setReady(true);

        // Draw the first frame immediately
        drawFrame(0);

        // --- Phase 2: Lazily load remaining frames in background ---
        let loadIndex = PRELOAD_COUNT;
        const loadNext = () => {
          if (loadIndex >= TOTAL_FRAMES) return;
          loadFrame(loadIndex).then(() => {
            loadIndex++;
            // Use requestIdleCallback if available, otherwise setTimeout
            if ('requestIdleCallback' in window) {
              (window as Window).requestIdleCallback(loadNext);
            } else {
              setTimeout(loadNext, 16);
            }
          });
        };
        loadNext();

        // --- Phase 3: ScrollTrigger setup ---
        // Main pin + scrub trigger
        ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: '+=1500', // tune to desired scroll length
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const frameIndex = progressToFrameIndex(self.progress);
            drawFrame(frameIndex);
          },
        });

        // --- Phase 4: Overlay text animation ---
        if (headline) {
          // Headline visible at start, fades out 20–30% progress
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: container,
              start: 'top top',
              end: '+=1500',
              scrub: true,
            },
          });

          // 0–20% progress: headline fully visible
          tl.to(
            headline,
            {
              opacity: 1,
              y: 0,
              duration: 0.2, // represents 20% of the scroll
            },
            0
          );

          // 20–30% progress: fade out and shift up
          tl.to(
            headline,
            {
              opacity: 0,
              y: -60,
              duration: 0.1, // represents 10% of the scroll
            },
            0.2
          );
        }

        // Handle canvas resize
        const handleResize = () => {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = canvas.clientWidth * dpr;
          canvas.height = canvas.clientHeight * dpr;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.scale(dpr, dpr);
          drawFrame(lastDrawnRef.current);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      });
    },
    { scope: containerRef } // useGSAP scoping + auto-cleanup on unmount
  );

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-onyx"
    >
      {/* Poster — the intended LCP element. Only this image gets `priority`.
          Visible until frames are preloaded and canvas takes over. */}
      <Image
        src="/frames/poster.webp"
        alt="FTNEXT — global logistics"
        fill
        priority
        className={`object-cover transition-opacity duration-500 ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
      />

      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Overlay — semantic HTML for SEO/a11y, animated via transform/opacity only */}
      <div
        ref={headlineRef}
        className="absolute inset-0 z-10 flex items-center justify-center text-center px-6"
      >
        <div>
          <h1>[PLACEHOLDER] We Move Your World</h1>
          <p className="mt-4 text-steel max-w-xl mx-auto">
            [PLACEHOLDER] Subhead copy describing FTNEXT&apos;s logistics services.
          </p>
        </div>
      </div>
    </section>
  );
}
