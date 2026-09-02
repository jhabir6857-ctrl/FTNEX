---
name: seo-keyword-density
description: |
  SEO keyword density optimization and page audit skill. Use cases:
  (1) User provides page path and keywords for SEO optimization
  (2) User wants to improve keyword density on a page
  (3) User requests search engine ranking optimization
  (4) User needs SEO audit (meta tags, OG, hreflang, etc.)
  Triggers: keyword density, SEO optimization, SEO audit, SEO check
---

# SEO Keyword Density Optimization & Page Audit

Optimize page keyword density to 5%, ensure rich content (800-1000 words), and perform comprehensive SEO audit checks to improve search engine rankings.

## Core Goals

| Metric | Target | Description |
|--------|--------|-------------|
| **Word Count** | 800-1000 words | Content-rich pages rank better |
| **Keyword Density** | 3-5% | Natural integration, avoid stuffing |
| **SEO Audit** | 10/10 | Full technical SEO compliance |

## Input Parameters

- **Page Path**: Page component path or translation JSON file path
- **Keywords**: Target SEO keywords (multiple supported, comma-separated)

## Workflow

### 1. Collect Page Text

Based on page path, collect all relevant text content:

**For TSX/JSX page components**:
- Extract static text from JSX
- Extract translation keys from `t()` or `useTranslations` calls
- Find corresponding translation JSON files

**For translation JSON files**:
- Read all text values
- Ignore key names, only count values

### 2. Calculate Current Density

```
Keyword Density = (Keyword Occurrences / Total Words) × 100%
```

**Word counting rules**:
- English: Split by spaces
- Chinese: Count by characters

### 3. Check Page Content Volume

**Target word count: 800-1000 words**

| Status | Word Count | Action |
|--------|------------|--------|
| ❌ Insufficient | < 500 | Major content expansion needed |
| ⚠️ Low | 500-799 | Add 200-300 words |
| ✅ Ideal | 800-1000 | Maintain current state |
| ✅ Rich | > 1000 | Acceptable, watch readability |

### 4. Calculate Keyword Target Increment

```
Target Occurrences = Total Words × 5% = Total Words × 0.05
Needed Additions = Target Occurrences - Current Occurrences
```

### 5. Optimization Strategy

Execute optimizations by priority:

**A. Natural integration into existing text (Priority)**
**B. Enhance description text**
**C. Add new content sections**

### 6. Optimization Principles

1. **Stay Natural**: Keywords must read naturally, avoid stuffing
2. **Semantic Relevance**: Only add keywords in semantically relevant places
3. **Even Distribution**: Keywords should be evenly distributed
4. **Avoid Excess**: Max 1-2 keywords per sentence
5. **Use Variants**: Use keyword variants (plurals, synonyms)
6. **Content Depth**: Prioritize adding valuable content to reach word count

---

## SEO Audit Checklist

| # | Check Item | Requirement | Method |
|---|------------|-------------|--------|
| 1 | **Content Volume** | 800-1000 words | Count visible text words |
| 2 | **Canonical URL** | Set and pointing correctly | Check `<link rel="canonical">` |
| 3 | **Meta Title** | 40-60 chars, include keywords | Check `<title>` |
| 4 | **Meta Description** | 120-160 chars | Check `<meta name="description">` |
| 5 | **H1 Tag** | Exists and unique | Page should have only one H1 |
| 6 | **H2/H3 Hierarchy** | Proper structure | H3 only under H2 |
| 7 | **Image Alt Text** | All images have alt | Check `<img alt="">` |
| 8 | **Open Graph** | og:title, og:description, og:image | Check `<meta property="og:*">` |
| 9 | **Twitter Card** | twitter:card, twitter:title | Check `<meta name="twitter:*">` |
| 10 | **Hreflang** | All language versions | Check `<link rel="alternate" hreflang="">` |
| 11 | **Indexability** | No noindex | Check robots settings |
