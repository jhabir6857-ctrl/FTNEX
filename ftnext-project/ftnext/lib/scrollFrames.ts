/**
 * Frame-sequence helpers for the scroll-scrubbed hero canvas.
 * See build spec Section 6.
 *
 * Frame naming uses 3-digit padding: frame_001.webp … frame_180.webp
 * (matching the output of process-frames.js).
 */

export const TOTAL_FRAMES = 180;

// Roughly the first 15% of the sequence — preloaded eagerly before scroll playback starts.
export const PRELOAD_COUNT = 25;

/**
 * Scene segment boundaries (0-indexed frame numbers).
 * Each scene occupies exactly 1/3 of the 180 frames.
 */
export const SEGMENTS = {
  plane:  { start: 0,   end: 59  },  // frames 1–60
  ship:   { start: 60,  end: 119 },  // frames 61–120
  truck:  { start: 120, end: 179 },  // frames 121–180
} as const;

/**
 * Map a 0–1 scroll progress value to a 0-indexed frame index.
 */
export function progressToFrameIndex(progress: number): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const index = Math.round(clamped * (TOTAL_FRAMES - 1));
  return Math.min(index, TOTAL_FRAMES - 1);
}

/**
 * Get the public path for a given 0-indexed frame.
 * Files are named frame_001.webp … frame_180.webp (1-indexed, 3-digit padded).
 */
export function getFramePath(index: number): string {
  const fileNumber = String(index + 1).padStart(3, '0');
  return `/frames/desktop/frame_${fileNumber}.webp`;
}
