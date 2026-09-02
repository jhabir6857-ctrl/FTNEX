'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

/**
 * Lightweight mobile hero. See build spec Section 6, "Mobile":
 * "ScrollCanvasMobile.tsx renders the shorter/lower-res sequence, OR swaps
 * to a looping background video if that path is chosen."
 *
 * No mobile frame sequence (public/frames/mobile/) was ever generated —
 * only the desktop 180-frame set exists — so this takes the video path
 * explicitly allowed as an alternative, reusing the hero video assets that
 * were already generated (public/video/hero-mobile.*).
 *
 * Deliberately NOT scroll-scrubbed or pinned: canvas frame-stepping at
 * 12-15fps is a desktop-only budget per the spec's performance targets,
 * and low/mid-end Android is the explicit stress case to protect here.
 * This is autoplay + loop only, no ScrollTrigger, no pin — the cheapest
 * possible hero that still feels alive.
 */
export function ScrollCanvasMobile() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const video = videoRef.current;
    if (!video) return;
    for (const entry of entries) {
      if (entry.isIntersecting) {
        video.play().catch(() => {
          console.warn('[ScrollCanvasMobile] Autoplay blocked by browser');
        });
      } else {
        video.pause();
      }
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.25 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [handleIntersection]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-onyx">
      {/* Poster — LCP element, only this gets priority */}
      <Image
        src="/video/hero-poster.webp"
        alt="FTNEXT — global logistics"
        fill
        priority
        className={`object-cover transition-opacity duration-700 ${
          videoReady ? 'opacity-0' : 'opacity-100'
        }`}
      />

      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          videoReady ? 'opacity-100' : 'opacity-0'
        }`}
        muted
        playsInline
        loop
        preload="metadata"
        poster="/video/hero-poster.webp"
        onCanPlay={() => setVideoReady(true)}
      >
        <source src="/video/hero-mobile.webm" type="video/webm" />
        <source src="/video/hero-mobile.mp4" type="video/mp4" />
      </video>

      {/* Overlay — real semantic HTML, no scroll-tied animation on mobile */}
      <div className="absolute inset-0 z-10 flex items-center justify-center text-center px-6">
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
