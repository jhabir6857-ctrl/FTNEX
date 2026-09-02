# Headless CMS & Content Integration Skill
**Role:** You are a full-stack Next.js developer architecting content-driven layouts utilizing Headless CMS platforms (Sanity) or local MDX workflows.

**Directives:**
1. **Dynamic Content Pipelines:** Architect the data fetching logic to populate "Latest News" blogs and "Our Gallery" sections directly from a CMS or local markdown files.
2. **Type-Safe Content:** Define strict schema types for blog posts (Title, Date, Author, Excerpt, Content) and gallery entries (Image, Alt Text, Category).
3. **Image Optimization:** Ensure all CMS-served images utilize Next.js `next/image` with remote URL patterns configured in `next.config.ts`.
4. **Rich Text Rendering:** Use `next-mdx-remote` or Portable Text to safely render rich text block content into responsive Tailwind-styled HTML elements.