# FTNEXT — Agent Build Instructions

Read `ftnext-build-spec.md` in this repo root first — it is the full specification for this project (folder structure, page specs, data models, design tokens, and the hero canvas implementation details). Read `ASSETS.md` next — it covers exactly where binary assets (frame sequences, sprite sheets, logos, photography) and final client copy get placed, and what to do while they're still missing. This scaffold already reflects the build spec's folder structure and includes:

- Config files (`package.json`, `tailwind.config.ts`, `next.config.js`, `tsconfig.json`, `postcss.config.json`) — ready to `npm install`.
- `app/globals.css` with all brand design tokens as CSS variables + Tailwind base.
- `data/*.ts` — typed data models with placeholder sample data, matching Section 7 of the spec.
- `lib/*.ts` — stub utility hooks referenced by the hero canvas.
- `components/**` — stub components with props/structure defined per Section 8 of the spec, marked with `// TODO` where implementation logic is intentionally left for the agent to complete per spec.
- `app/**/page.tsx` — one stub route per page in Section 5, with the section list for that page as comments.

## Build order
Follow Section 11 of `ftnext-build-spec.md`. In short:
1. `npm install` and confirm the dev server boots (`npm run dev`) with the stub pages.
2. Build out `NavBar` / `Footer` fully.
3. Build `ReducedMotionHero` first (static, accessible) so Home works end-to-end before the canvas sequence exists.
4. Build `ScrollCanvas` once real frame/sprite assets are dropped into `public/frames/` and `public/sprites/` — do not attempt to source or generate these assets; they come from the client's After Effects export pipeline.
5. Build remaining sections against the data files in `data/`.
6. Wire up the mobile hero variant.
7. Accessibility + performance pass per Section 9.

## Hard constraints (do not deviate without flagging to the user)
- Overlay/UI animations during scroll: animate only `transform` and `opacity`. Never animate `top`, `height`, `margin`, or other layout-triggering properties in scroll-scrubbed contexts.
- Use `@gsap/react`'s `useGSAP()` hook for any component mounting GSAP timelines or ScrollTrigger instances — not raw `useEffect`. This is required for correct cleanup on Next.js App Router route changes.
- The hero poster image is the intended LCP element. Only it gets `priority` on its `next/image` — no sprite sheet or frame image should be marked priority.
- Respect `prefers-reduced-motion`: render `ReducedMotionHero` instead of `ScrollCanvas` when set (see `lib/useReducedMotion.ts`).
- Do not invent office locations, real stats, or final copy — placeholders are marked `[PLACEHOLDER]` throughout and should stay easy to find/replace, not be treated as final content.

## Open items still needing a decision (Section 10 of the spec)
Track Shipment scope, CMS vs. static content, typography approval, copywriting ownership, real office locations, mobile hero format (sequence vs. video), and form backend are all currently defaulted — see the spec for the assumed defaults.
