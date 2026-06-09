# 🧠 kajubadam Vocabulary — Brain File

> **Purpose:** Lifetime memory for AI assistant sessions. Read this file first before responding to the user.
> **Format:** Structured Markdown. Append new conversation summaries at the bottom.

---

## 🏠 Project Overview

| Field | Value |
|---|---|
| **Domain** | `kajubadamvocabulary.in` |
| **Tech Stack** | Next.js 16.2.6, React 19.2.4, TypeScript, Tailwind CSS, Supabase, Razorpay |
| **Repo** | `kajubadam-vocabulary` (private) |
| **GTM ID** | `GTM-KFLQ24ZX` |
| **Google Search Console** | Verified (`SpVz4k1wVaC1zqg_dF-XqbnG7W2hX_odO98s3up0kWM`) |
| **Social** | Twitter: `@kajubadamvocab`, Telegram: `kajubadamvocabulary` |

### Target Audience
- SSC CGL, CHSL, MTS, CPO aspirants
- Banking exams (IBPS PO, SBI PO, RBI Grade B)
- UPSC (CDS, NDA, CAPF)
- Hindi-medium students wanting to improve English vocabulary

### Business Model
- **Freemium:** Daily news (free) + 2 free sample stories
- **Paid (one-time, lifetime):**
  - Part 1: ₹299 — 5,062 words across 48 stories
  - Part 2: ₹399 — 6,700 words across 67 stories
  - SSC Error Detection 716 PYQ: ₹149
  - SSC Sentence Improvement 790 PYQ: ₹149
  - Complete Bundle (Part 1 + Part 2): ₹599

---

## 📂 Content Inventory

| Content Type | Count | Free/Paid |
|---|---|---|
| Stories (Part 1) | 48 | Saga 1-01 free; rest paid |
| Stories (Part 2) | 67 | Saga 2-01 free; rest paid |
| Daily News | 9 (31 May – 8 June 2026) | All free |
| Error Detection PYQ | 716 questions | Page 1 free (50 Q), rest paid |
| Sentence Improvement PYQ | 790 questions | Page 1 free (50 Q), rest paid |
| **Blog Posts** | **11** (serialNumber 1-11) | **All free** |
| Static Pages | Home, About, Contact, Pricing, Privacy, Terms, Disclaimer, Blog | All free |

### Site Structure
- **Home tabs:** VOCAB PART 1, VOCAB PART 2, DAILY NEWS VOCAB, ERROR DETECTION, SENTENCE IMPROVEMENT
- **Standalone pages (no tab):** `/pricing`, `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/blog`
- **Blog:** `/blog` listing page + `/blog/[slug]` individual posts

---

## 🔍 SEO Status (as of June 8, 2026)

### Rankings
| Search Query | Position |
|---|---|
| `kajubadam vocabulary` | 🏆 #1 (dominates top 10) |
| `kajubadam` | ❌ Not in top 10 (e-commerce sites) |
| Broad keywords (SSC vocabulary, English Hindi vocabulary, etc.) | ❌ Not ranking (competing with Testbook, Cracku, BYJU'S, Physics Wallah, etc.) |

### Current SEO Setup (Already Strong)
- ✅ JSON-LD structured data (Organization, WebSite, Course, FAQPage)
- ✅ Sitemap with priorities & change frequencies
- ✅ Robots.txt (disallows `/api/`, `/admin/`, `/iswebkaram/`)
- ✅ Google Search Console verified
- ✅ Google Tag Manager installed
- ✅ Rich meta tags, OG tags, Twitter cards
- ✅ Daily fresh content (daily news)
- ✅ FAQPage schema for rich snippets
- ✅ RSS Feed (`/feed.xml`)
- ✅ `llms.txt` for AI training
- ✅ Canonical URLs, hreflang (en/hi)

### SEO Improvements Made
1. ✅ **Blog section created** at `/blog` with 10 posts (serialNumber 1-10)
2. ✅ **Footer updated** — Blog link added to all pages
3. ✅ **Sitemap updated** — Blog pages included
4. ✅ **Post 003 frontmatter bug fixed** — Hindi text before `---` was breaking gray-matter parsing

### Remaining SEO Gaps
1. ❌ No hub/guide pages yet (e.g., "SSC CGL Vocabulary Complete Guide")
2. ❌ Limited free content — only 2 free stories; more free entry points needed

### Blog Posts Published (10)
| # | Slug | Category |
|---|------|----------|
| 001 | `Top-phrasal-verbs-look-part-1` | Idioms & Phrasal Verbs |
| 002 | `confusing-phrasal-verbs-look-part-2` | Idioms & Phrasal Verbs |
| 003 | `pyqs-phrasal-verbs-look-for-ssc-cgl-bank-po` | Idioms & Phrasal Verbs |
| 004 | `interactive-quiz-look-phrasal-verbs-part-4` | Idioms & Phrasal Verbs |
| 005 | `phrasal-verbs-get-part-5` | Idioms & Phrasal Verbs |
| 006 | `advanced-get-phrasal-verbs-part-6` | Idioms & Phrasal Verbs |
| 007 | `pyqs-phrasal-verbs-get-part-7` | Idioms & Phrasal Verbs |
| 008 | `fill-in-the-blanks-get-phrasal-verbs-quiz-part-8` | Idioms & Phrasal Verbs |
| 009 | `most-common-phrasal-verbs-take-part-9` | Idioms & Phrasal Verbs |
| 010 | `confusing-phrasal-verbs-take-part-10` | Idioms & Phrasal Verbs |
| 011 | `take-phrasal-verbs-previous-year-questions` | Idioms & Phrasal Verbs |

---

## 🗺️ Blog Roadmap (June 8, 2026)

### What Was Built
1. **Strategy folder read & understood** — 7 files in `content/strategy/` with complete 1,000-post plan
2. **Roadmap data file** — `lib/roadmap.ts` with all 5 categories, sub-categories, and topic details
3. **Public roadmap page** — `/blog/roadmap` with:
   - Progress bar (currently 2/1000 published)
   - 5 expandable category cards with sub-category accordions
   - Topic generation formulas section
   - Published posts tracker
   - URL hierarchy visualization
4. **Blog page updated** — "View Roadmap" button added to `/blog` header
5. **Sitemap updated** — `/blog/roadmap` added

### The 5 Categories
| # | Category | Posts | Icon | Slug |
|---|---|---|---|---|
| 1 | Idioms, Phrases & Phrasal Verbs | 210 | 💬 | `idioms-phrases-phrasal-verbs` |
| 2 | Grammar Rules & Error Spotting | 200 | 📝 | `grammar-error-spotting` |
| 3 | Topic-wise Vocabulary (Micro-Niche) | 180 | 🏷️ | `topic-wise-vocabulary` |
| 4 | A to Z Vocabulary Series | 260 | 🔤 | `a-to-z-vocabulary` |
| 5 | Daily Sentences & Spoken English | 150 | 💬 | `daily-sentences-spoken-english` |
| **Total** | | **1,000** | | |

### Note
- Category 2 (Topic-wise Vocabulary, 180 posts) had an empty file (`3.catogery 2_ 180 post.md`) — data sourced from masterplan outline
- Category 3 (Grammar & Error Spotting, 200 posts) file is `2.catogery 3 _ 200 post.md` (filename prefix doesn't match category number)
- URL hierarchy follows silo architecture: `/blog/{category}/{post-slug}`
- The roadmap is dynamic (clickable accordions), no build-time overhead

---

## 📊 Progress Tracker (Offline)

A Python script `scripts/track.py` tracks blog post progress and annotates strategy files:

| File | Range | Current |
|------|-------|---------|
| `1.catogery 4_ 210 post.md` | 1-210 | **11/210** (5%) |
| `2.catogery 3 _ 200 post.md` | 211-410 | **0/200** (0%) |
| `3.catogery 2_ 180 post.md` | 411-590 | **0/180** (0%) |
| `4.catogery 1_ 260 post.md` | 591-850 | **0/260** (0%) |
| `5.catogery 5 _ 150 post.md` | 851-1000 | **0/150** (0%) |
| **Total** | **1-1000** | **11/1000** (1%) |

**Usage:** `python scripts/track.py` — updates all strategy files with fresh banners + ✅/❌ markers
**How it works:** Reads `serialNumber` from blog post frontmatter, compares to strategy file ranges, annotates each post line

---

## 📋 Pending Tasks

## 💬 Conversation History & Decisions

### Session 1 (June 8, 2026)
**Topics discussed:**
1. **Google Ranking Check** — User asked to see website rank on Google
2. **SEO Reality Check** — Explained that ranking #1 for every keyword is impossible; big competitors dominate broad keywords
3. **Content Strategy** — User chose "Content Strategy" option
4. **Misstep & Correction** — Initially suggested converting daily news to blog format; user correctly pointed out daily news pages ARE already blog posts with rich content (editorial + 45 questions + vocabulary + FAQ)
5. **Corrected Gaps:**
   - Need Hub/Guide pages (e.g., SSC CGL Vocabulary Complete Guide)
   - Need Blog section for standalone articles
   - Need More free resource pages
6. **Brain File Created** — `kajubadam-brain.md` for persistent memory across sessions
7. **Blog Section Implemented** — Chose Option 2 (separate `/blog` page, no new tab):
   - Created `lib/blog.ts` — blog library
   - Created `content/blog/` — 2 sample blog posts (top 50 idioms, how to prepare English)
   - Created `app/blog/page.tsx` — listing page
   - Created `app/blog/[slug]/page.tsx` — individual post page with markdown rendering
   - Updated `app/layout.tsx` footer — added Blog link
   - Updated `app/sitemap.ts` — added blog pages
   - Blog posts are accessible via: footer, homepage (future), Google search

**Decisions made:**
- Blog will be a **separate page** at `/blog` (not a tab on homepage)
- Blog posts will be **free** (all free, no paywall)
- Blog content will use **markdown files** in `content/blog/` directory
- Each blog post will have **internal links** to paid/premium content
- First 2 blog posts: "Top 50 Idioms for SSC CGL" + "How to Prepare English for SSC CGL"

---

## 📋 Pending Tasks (To-Do)

- [ ] Create Hub page: SSC CGL Vocabulary Complete Guide
- [ ] Add "Latest from Blog" section on homepage
- [ ] Create free resource page: "Top 100 SSC Vocabulary Words with Hindi Meanings"
- [ ] Write detailed content strategy document
- [ ] Add more blog posts targeting different keywords

## ✅ Completed Tasks

- [x] **Post 003 frontmatter bug fixed** — Hindi text before `---` was breaking gray-matter parsing
- [x] **Tracking API route deleted** — `app/api/iswebkaram/tracking/` removed; tracking now offline only
- [x] **Tracking tab removed from admin panel** — `app/iswebkaram/page.tsx` cleaned
- [x] **Strategy files annotated** — All 5 strategy files get progress banners + [✅]/[❌] markers via `scripts/track.py`
- [x] **Python tracker fixed** — Uses full range (endSerial - startSerial + 1) instead of line parsing; properly handles empty files

---

## 📋 Website Summary (For AI Content Generation)

Use this summary with any AI to generate blog post topics targeting TOP 3 Google rankings.

```
Domain: kajubadamvocabulary.in
Niche: English-Hindi Vocabulary Learning

TARGET AUDIENCE (2 Groups):

GROUP 1 — Government Job Aspirants:
  • SSC (CGL, CHSL, MTS, CPO) — English section
  • Banking (IBPS PO/Clerk, SBI PO, RBI Grade B) — English section
  • UPSC (CDS, NDA, CAPF) — English paper
  • Railway exams — English section
  • State PCS exams — English section
  • Insurance exams (LIC, NIACL) — English section

GROUP 2 — General Hindi-medium public:
  • Students wanting to improve English vocabulary
  • Hindi speakers learning English through Hindi translations
  • Anyone preparing for English communication/spoken English
  • School/college students needing English grammar help

CURRENT CONTENT:
  • 115+ bilingual stories (48 Part 1 + 67 Part 2) — 11,762+ vocab words
  • Daily news vocabulary articles (45 exam-style Qs each) — FREE
  • SSC Error Detection 716 PYQ with bilingual explanations
  • SSC Sentence Improvement 790 PYQ with bilingual explanations
  • Blog section for SEO articles

UNIQUE SELLING POINT:
  • Story-based vocabulary learning with Hindi translations
  • Interactive fill-in-the-blank quizzes for active recall
  • Bilingual (English + Hindi) — perfect for Hindi-medium students
  • One-time payment, lifetime access (₹299-₹599)

GOAL: Rank TOP 3 for:
  • Government job English preparation keywords
  • English to Hindi vocabulary keywords
  • SSC/Banking English grammar topics
  • Idioms, phrases, error detection, sentence improvement
  • General English learning for Hindi speakers

BLOG POST FORMAT:
  - SEO-optimized title with target keyword
  - Hindi translations throughout
  - Internal links to kajubadamvocabulary.in stories/products
  - English explanation + Hindi translation
  - 1000-2000 words per post
```

---

## ⚡ Important Notes for AI
- **Always read this file first** when starting a new session.
- When user says "continue" — refer to Pending Tasks section to know what was discussed.
- The user communicates in Hindi-English mix (Hinglish).
- The user knows their project well — don't suggest things they already have.
- Be honest and specific, not generic.
- The daily news pages on this site already have full editorial text + Hindi translation + 45 questions + vocabulary table + FAQ — they ARE already blog posts.
- Blog section was recently created — see Session 1 for implementation details.
