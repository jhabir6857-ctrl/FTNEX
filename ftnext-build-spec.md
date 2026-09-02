# FTNEXT — Full Build Specification
**Purpose:** This document is written to be handed directly to an agentic coding tool (e.g. Google Antigravity) to scaffold and build the FTNEXT marketing website end-to-end. It replaces the earlier direction-only plan with explicit, unambiguous build instructions.

**Assumptions made to unblock the build** (flagged inline throughout, summarized in Section 10) — confirm or override before/while building:
- "Track Shipment" ships as a UI-only placeholder for launch (no live backend integration).
- Fleet/Partners/Services content is static, driven by local JSON/TS data files (not a CMS) for v1.
- Typography choices below are proposed defaults, not yet client-approved.
- Placeholder copy is used throughout; final copy is a swap-in, not a structural change.

---

## 1. Project Overview

- **Client:** FTNEXT — logistics/shipping company, Bangladesh.
- **Reference concept:** Akij Shipping (site structure/tone) + 99designs "reddish vibe" (visual direction), elevated into a cinematic, premium execution — intentionally more ambitious than the Akij reference, which is a conventional corporate site.
- **Core experience:** A scroll-driven cinematic hero (drone-tracking journey through clouds → ocean → coastal highway) rendered via a canvas frame sequence, followed by standard marketing pages.
- **Tone:** Industrial, confident, premium-dark, urgent-but-trustworthy (crimson accent on gunmetal/onyx).

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | TypeScript throughout |
| Styling | Tailwind CSS | Config extended with brand tokens (Section 4) |
| Animation | GSAP + ScrollTrigger | Drives hero canvas + secondary micro-interactions |
| Micro-interactions | Reused 2D vector explainer assets (existing FTNeX pipeline) | Lottie or SVG+GSAP, whichever the existing assets are authored as — confirm export format |
| Forms | React state + server action (Next.js) | No external form service assumed; swap in easily if client has a preference (e.g. Formspree, HubSpot) |
| Deployment target | Vercel (assumed) | Confirm if client has a different hosting requirement |
| Image formats | WebP (primary), with static fallback poster frame | AVIF optional stretch goal for further compression |

---

## 3. Folder Structure

```
ftnext/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Home
│   ├── about/page.tsx
│   ├── services/page.tsx
│   ├── fleet/page.tsx
│   ├── partners/page.tsx
│   ├── contact/page.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── NavBar.tsx
│   │   └── Footer.tsx
│   ├── hero/
│   │   ├── ScrollCanvas.tsx        # Core frame-sequence scrubber
│   │   ├── ScrollCanvasMobile.tsx  # Lightweight mobile variant
│   │   └── ReducedMotionHero.tsx   # Static fallback
│   ├── sections/
│   │   ├── ServiceGrid.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── StatBlock.tsx
│   │   ├── FleetGrid.tsx
│   │   ├── FleetCard.tsx
│   │   ├── PartnerLogos.tsx
│   │   └── ContactForm.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── SectionHeading.tsx
├── data/
│   ├── services.ts
│   ├── fleet.ts
│   ├── partners.ts
│   └── site-config.ts
├── lib/
│   ├── scrollFrames.ts             # Frame path/index helpers
│   └── useReducedMotion.ts         # Hook wrapping prefers-reduced-motion
├── public/
│   ├── frames/
│   │   ├── desktop/                # frame_0001.webp ... frame_0200.webp
│   │   └── mobile/                 # shorter/lower-res sequence
│   ├── sprites/                    # Sprite sheets (see Section 6)
│   └── vectors/                    # Reused 2D explainer assets
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

---

## 4. Design Tokens

### Colors (add to `tailwind.config.ts` under `theme.extend.colors`)

```js
colors: {
  crimson: { DEFAULT: '#C91A25', hover: '#E02430' },
  gunmetal: '#3A3F47',
  chrome: '#E2E8F0',
  steel: '#94A3B8',
  onyx: '#0B0E14',
  slate: '#131822',
  elevated: '#1C2331',
}
```

| Token | Hex | Usage |
|---|---|---|
| `crimson` | `#C91A25` | Primary CTAs, active nav, progress indicators, map pins |
| `crimson-hover` | `#E02430` | Hover/glow states |
| `gunmetal` | `#3A3F47` | Secondary UI, icon badges, inactive tabs, dark card borders |
| `chrome` | `#E2E8F0` | Headline type, high-contrast stats, icon fills on dark bg |
| `steel` | `#94A3B8` | Body text, labels, metadata, placeholders |
| `onyx` | `#0B0E14` | Global background, canvas backdrop, footer |
| `slate` | `#131822` | Cards, drawers, form containers |
| `elevated` | `#1C2331` | Card hover state (pair with `border-crimson/40`) |

### Typography (proposed — confirm with client)

- **Headline:** `Space Grotesk` or `General Sans` (geometric/grotesque, confident weight) — used for H1/H2, stat callouts.
- **Body:** `Inter` — legible workhorse font for paragraph copy, form fields, data-dense sections (schedules, specs).
- Load both via `next/font` for zero layout shift.

### Type scale (Tailwind defaults extended if needed)

- H1: 3.5rem / bold / `chrome`
- H2: 2.25rem / semibold / `chrome`
- Body: 1rem / regular / `steel`
- Micro/labels: 0.75rem / uppercase / tracked / `steel`

---

## 5. Page Specifications

### 5.1 Home (`app/page.tsx`)
1. **NavBar** — logo left, links (Home/About/Services/Fleet/Partners/Contact) center or right, "Request a Quote" crimson button far right.
2. **Hero — ScrollCanvas** — full-viewport cinematic scroll sequence (see Section 6). Includes overlaid headline + subhead that fades/transforms as user scrolls (e.g. "We Move Your World" / subtext in steel).
3. **Stat strip** — 3–4 `StatBlock`s (e.g. years in operation, fleet size, countries served, cargo volume). Placeholder numbers until client supplies real ones.
4. **ServiceGrid** — preview of 3–6 services (Ship Owners, Charterer/Operator, Technical Manager, Shipping Agent, Trading, Coastal Vessels — mirrors Akij's category set), each a `ServiceCard` linking to `/services`.
5. **Fleet teaser** — 2–3 `FleetCard`s with "View Full Fleet" link to `/fleet`.
6. **PartnerLogos** — logo strip, links to `/partners`.
7. **CTA band** — crimson-accented band: "Ready to move your cargo?" + Request a Quote button.
8. **Footer.**

### 5.2 About (`app/about/page.tsx`)
- Hero banner (static image, not the scroll canvas — reserve that for Home only).
- Company narrative section (placeholder copy: founding story, mission).
- Timeline/milestones component (optional — Akij has one; can reuse `StatBlock`-style layout horizontally).
- Leadership/team section (optional, pending client content).
- CTA band + Footer.

### 5.3 Services (`app/services/page.tsx`)
- Static hero banner.
- Full `ServiceGrid` with all service categories, each expandable or linking to a detail block (accordion or anchor sections — pick accordion for simplicity, using shadcn/ui `Accordion` if available, else custom).
- Each service: title, icon, 2–3 sentence description, placeholder copy.
- CTA band + Footer.

### 5.4 Fleet (`app/fleet/page.tsx`)
- Static hero banner.
- `FleetGrid` of `FleetCard`s — each vessel: name, type, capacity/tonnage, image, optional spec sheet link.
- Data sourced from `data/fleet.ts` (see Section 7).
- CTA band + Footer.

### 5.5 Partners (`app/partners/page.tsx`)
- Static hero banner.
- `PartnerLogos` grid, larger format than the homepage strip, optionally grouped by category (ports, agents, technical partners).
- CTA band + Footer.

### 5.6 Contact (`app/contact/page.tsx`)
- Static hero banner.
- `ContactForm` — fields: Name, Email, Company, Message, Subject/Department dropdown (Chartering / Operations / Technical / Agency — mirrors Akij's email routing).
- Office locations list (Dhaka HQ, Chittagong, Singapore, Dubai — placeholder until client confirms which offices apply to FTNEXT specifically; do not assume FTNEXT has the same offices as Akij).
- Footer (no CTA band needed here).

---

## 6. Hero Canvas Sequence — Implementation Spec

This is the most technically distinctive piece and needs the most precision for an agent to build correctly.

### Frame assets
- **Desktop sequence:** 180–225 frames, `1600px` wide, WebP, named `frame_0001.webp` … `frame_0225.webp`, stored in `public/frames/desktop/`.
- **Mobile sequence:** Separate, shorter/lower-res sequence (target: ~60–90 frames, `800px` wide) in `public/frames/mobile/`, OR a looping `.mp4`/`.webm` video as an alternative — decide based on final asset review; spec both paths in code via a feature flag.
- **Sprite sheets (recommended over 180 discrete requests):** Bundle into ~10 sheets of ~18–23 frames each, named `sprite_01.webp` … `sprite_10.webp`, stored in `public/sprites/`. `lib/scrollFrames.ts` should expose a helper that maps a frame index → `{ sheetIndex, offsetX, offsetY }` for canvas slicing.
- **Poster/placeholder:** One low-res blurred still (`public/frames/poster.webp`) shown under the canvas before frames load, to prevent blank flashes.

### Behavior
- `ScrollCanvas.tsx` mounts a `<canvas>` covering the hero viewport.
- On mount: preload frames/sprites 1 through ~25 (roughly the first 15% of the sequence) before allowing scroll-driven playback; show the poster placeholder until this completes.
- Remaining frames/sprites stream in as the user scrolls, using GSAP `ScrollTrigger` with `scrub: true`, mapping scroll progress (0–1) linearly to frame index (0–224).
- `ScrollTrigger.pin` should hold the hero in place for the duration of the scroll journey (e.g. `end: '+=3000'`, tune based on desired scroll length).
- Overlaid text elements (headline/subhead) animate in/out via GSAP timelines synced to specific scroll-progress ranges (e.g. headline visible 0–20%, fades out 20–30%).

### Reduced motion / accessibility
- `lib/useReducedMotion.ts` wraps `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- If reduced motion is preferred: render `ReducedMotionHero.tsx` instead — a static hero image with a simple fade-in, no scroll-hijacking, no pinning.
- All real page content (headline, subhead, nav, CTAs) must exist as real semantic HTML elements layered over the canvas — never baked into the frame images themselves — so it's crawlable and screen-reader accessible regardless of which hero variant renders.

### Mobile
- `ScrollCanvasMobile.tsx` renders the shorter/lower-res sequence, or swaps to a looping background video if that path is chosen. Breakpoint: render mobile variant below `768px` (Tailwind `md`).

### Performance targets
- Explicitly treat the **poster/placeholder image** as the LCP element (it should be the first meaningful paint), not the fully-loaded canvas sequence — set this via priority loading (`next/image` with `priority`, or eager-loaded `<img>` for the poster).
- Total initial payload (poster + first ~25 frames/sprite chunk) should be budgeted and measured — target under ~1.5MB for first meaningful interaction on mobile.
- Test on a mid/low-end Android device before considering this component done; canvas repaint at scroll speed is the most likely place performance falls apart.

---

## 7. Data Models

`data/services.ts`
```ts
export type Service = {
  id: string;
  title: string;
  icon: string; // path to icon asset
  summary: string; // 1-2 sentence card copy
  description: string; // full copy for /services detail
};
```

`data/fleet.ts`
```ts
export type Vessel = {
  id: string;
  name: string;
  type: string; // e.g. "Bulk Carrier", "Coastal Vessel"
  capacityTonnage: number;
  image: string;
  specSheetUrl?: string;
};
```

`data/partners.ts`
```ts
export type Partner = {
  id: string;
  name: string;
  logo: string;
  category: 'port' | 'agent' | 'technical' | 'other';
  url?: string;
};
```

`data/site-config.ts` — nav links, footer links, office locations, social links, form department options. Centralizes anything that would otherwise be hardcoded across components.

---

## 8. Component Notes

- **Button.tsx** — variants: `primary` (crimson bg, chrome text, hover → `crimson-hover` + glow shadow), `secondary` (gunmetal border, transparent bg), `ghost` (text-only, steel).
- **ServiceCard.tsx / FleetCard.tsx** — base state: `bg-slate`, `border-gunmetal`. Hover state: `bg-elevated`, `border-crimson/40` glow, per the design tokens above.
- **NavBar.tsx** — sticky, transparent over hero, solid `bg-onyx/90` with backdrop blur once scrolled past hero (scroll listener or `IntersectionObserver`).
- **ContactForm.tsx** — client component, controlled inputs, submit via a Next.js server action; on success show inline confirmation (no page redirect). No external form service wired up by default (see assumptions).

---

## 9. Non-Functional Requirements

- **Accessibility:** WCAG AA contrast minimum for all text/background pairs (verify `steel` on `onyx`/`slate` meets 4.5:1 — may need a slightly lighter shade for small body text if it doesn't; flag if so). `prefers-reduced-motion` respected. All interactive elements keyboard-navigable.
- **SEO:** Real semantic HTML for all page content (not canvas-only). Per-page `metadata` exports in Next.js App Router for title/description/OG tags.
- **Performance:** Core Web Vitals — LCP, CLS, INP — measured post-build via Lighthouse, with the hero poster strategy above specifically to protect LCP.
- **Responsive breakpoints:** Mobile (<768px), tablet (768–1024px), desktop (>1024px). Mobile gets the lightweight hero variant per Section 6.

---

## 10. Open Items Requiring Client/Team Sign-Off

These are assumed defaults in this spec so the build can start — confirm or override:

1. **Track Shipment** — built as UI placeholder only for v1 (no backend). If live tracking is needed at launch, this requires a separate architecture spec (API integration, auth, data source) before build.
2. **Content ownership** — static JSON/TS data files assumed for v1 (Section 7). If client needs to self-serve update Fleet/Partners/Services post-launch, a lightweight CMS (e.g. Sanity, Contentful) should be scoped instead.
3. **Typography** — `Space Grotesk`/`General Sans` + `Inter` proposed; not yet client-approved.
4. **Copy** — placeholder throughout; final copywriting scope (who owns it) still unresolved.
5. **Office locations for Contact page** — do not assume FTNEXT shares Akij's exact office list (Dhaka/Chittagong/Singapore/Dubai); confirm actual FTNEXT locations.
6. **Mobile hero delivery** — short frame sequence vs. looping video not yet decided; both paths are stubbed in the folder structure so either can be finalized without restructuring.
7. **Form backend** — no external service wired by default; confirm if client wants form submissions routed to a CRM/email service.

---

## 11. Suggested Build Order

1. Scaffold Next.js project, Tailwind config with design tokens, font loading.
2. Build layout shell: `NavBar`, `Footer`, base page routes with placeholder content.
3. Build `ReducedMotionHero` (static) first — ships a working, accessible homepage even before the canvas sequence is finalized.
4. Build `ScrollCanvas` once frame/sprite assets are delivered from the AE pipeline.
5. Build out `ServiceGrid`, `FleetGrid`, `PartnerLogos`, `ContactForm` against the data models in Section 7 (placeholder data first, real data swapped in later).
6. Wire up mobile hero variant.
7. Accessibility + performance pass (Lighthouse, reduced-motion testing, low-end device testing).
8. Resolve Section 10 open items and finalize copy/typography/content source before launch.
