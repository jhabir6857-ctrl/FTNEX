'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-zoom hero video component.
 *
 * Replaces the old canvas-based frame-sequence scrubber (ScrollCanvas.tsx).
 * The video autoplays when it enters the viewport (Intersection Observer),
 * loops naturally, and scroll position drives a subtle CSS scale transform
 * (1.0 → 1.15) via GSAP ScrollTrigger — pure CSS transform, no video
 * re-rendering or timeline scrubbing.
 *
 * Loading strategy:
 * - Poster image displays instantly (LCP element, priority loaded)
 * - preload="metadata" — does NOT auto-download the full video
 * - Autoplay only triggered when hero enters viewport
 * - <source media> queries serve 720p on mobile, native res on desktop
 */
export function HeroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // ─── Intersection Observer: viewport-triggered autoplay ───────────────
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const video = videoRef.current;
      if (!video) return;

      for (const entry of entries) {
        if (entry.isIntersecting) {
          // Video entered viewport — start playing
          video.play().catch(() => {
            // Autoplay may fail on some browsers — the poster still shows
            console.warn('[HeroVideo] Autoplay blocked by browser');
          });
        } else {
          // Video left viewport — pause to save resources
          video.pause();
        }
      }
    },
    []
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.25, // Trigger when 25% visible
    });

    observer.observe(video);

    return () => observer.disconnect();
  }, [handleIntersection]);

  // ─── GSAP ScrollTrigger: scroll-driven zoom ──────────────────────────
  useGSAP(
    () => {
      if (!containerRef.current || !videoWrapperRef.current) return;

      // Scroll-driven scale transform: 1.0 → 1.15
      // The container has overflow:hidden so the zoomed video stays clipped
      gsap.to(videoWrapperRef.current, {
        scale: 1.15,
        ease: 'none', // Linear mapping to scroll position
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top', // Zoom completes as hero scrolls out of view
          scrub: true, // Smooth tie to scroll position
          // No pin — the hero scrolls naturally, zoom just increases as it goes
        },
      });

      // ─── Overlay text animation ──────────────────────────────────────
      if (headlineRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });

        // 0–60% progress: headline visible
        tl.to(
          headlineRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          0
        );

        // 60–80% progress: fade out and shift up
        tl.to(
          headlineRef.current,
          {
            opacity: 0,
            y: -60,
            duration: 0.2,
          },
          0.6
        );
      }
    },
    { scope: containerRef }
  );

  // ─── Video ready handler ─────────────────────────────────────────────
  const handleCanPlay = useCallback(() => {
    setVideoReady(true);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-onyx"
    >
      {/* Poster — the intended LCP element. Only this image gets `priority`.
          Visible until the video signals it can play. */}
      <Image
        src="/video/hero-poster.webp"
        alt="FTNEXT — global logistics"
        fill
        priority
        className={`object-cover transition-opacity duration-700 ${
          videoReady ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Video wrapper — GSAP targets this for the scale transform.
          overflow:hidden on the parent section clips the zoomed content. */}
      <div
        ref={videoWrapperRef}
        className="absolute inset-0 h-full w-full will-change-transform"
      >
        <video
          ref={videoRef}
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          playsInline
          loop
          preload="metadata"
          poster="/video/hero-poster.webp"
          onCanPlay={handleCanPlay}
        >
          {/* Desktop sources (served on md+ viewports) */}
          <source
            src="/video/hero-desktop.webm"
            type="video/webm"
            media="(min-width: 768px)"
          />
          <source
            src="/video/hero-desktop.mp4"
            type="video/mp4"
            media="(min-width: 768px)"
          />

          {/* Mobile sources (served on <768px viewports) */}
          <source
            src="/video/hero-mobile.webm"
            type="video/webm"
          />
          <source
            src="/video/hero-mobile.mp4"
            type="video/mp4"
          />
        </video>
      </div>

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
