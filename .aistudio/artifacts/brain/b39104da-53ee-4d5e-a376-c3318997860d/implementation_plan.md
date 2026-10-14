# Distraction-Free Reading Experience & Admin Panel Content Publishing Suite

Enhance reading ergonomics across Vastu Ritam to eliminate visual distraction while strictly maintaining the authentic Vedic color format, and empower administrators to post, edit, upload images, and manage Prakaran articles and Shabd Kosh dictionary terms seamlessly.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed by the user in Phase 1:

- **Confirmed Decision 1 (Reading Focus & Typography)**: Eliminate eye strain and reading distraction by enforcing an optimal reading measure (`max-w-[72ch]`, ~65–75 characters per line), comfortable line spacing (`leading-[1.95]`), and removing intrusive inline sparkles from body text while preserving the exact authentic color format.
- **Confirmed Decision 2 (Ambient Animations Behavior)**: Restrict floating background petals exclusively to the Homepage hero banner; automatically pause/hide petals on all reading pages and article views.
- **Confirmed Decision 3 (Admin Panel Scope)**: Provide a comprehensive publishing workflow in the Admin Panel for both **Prakaran Articles** (with reliable image uploads, thumbnail preview, topic tagging, and live drafting) and **Vastu Shabd Kosh** terms (Sanskrit title, simple meaning, category, and full explanation).

---

## 1. Overview & Root Cause Analysis

- **The Reading Distraction Problem**:
  1. Floating red and green petals drifted across article text blocks, continually interrupting line tracking and causing visual fatigue.
  2. Entity links inside paragraphs rendered visual sparkle icons (`<Sparkles />`), creating distracting visual "speed bumps" in every second sentence.
  3. Reading line width on large screens stretched too wide, requiring excessive horizontal eye scanning.
- **The Admin Panel Content Gap**:
  1. Administrators need a dedicated, clearly labeled portal for posting new Prakaran articles, uploading and assigning custom featured images, and creating or updating Shabd Kosh vocabulary terms with Sanskrit roots.

---

## 2. User Experience & Visual Design

### A. Distraction-Free Reading Architecture
- **Palette Continuity**: Retain 100% of the authentic Vastu Ritam palette:
  - *Light Mode*: Parchment `#FAF6EE`, sacred walnut `#2D1B14`, temple gold `#D4A72C`, deep terracotta `#6B1F1F`.
  - *Dark Mode*: Obsidian `#140A0D` / mahogany `#1C0F13`, ivory `#FFF7ED`, luminous gold `#E8D3A8`.
- **Typographic Measure & Rhythm**:
  - Restrict prose text to `max-w-[70ch]` (the golden standard of editorial typography).
  - Clean paragraph leading: `leading-[1.95]` for natural eye movement between lines.
  - Quiet entity links: subtle, elegant underline with gold accent on hover, removing cluttering star icons inside paragraphs.
- **Homepage-Only Petal Scope**:
  - Floating petals are mounted strictly on the Homepage hero banner, preserving sacred ambience where welcome, but giving readers serene, motionless tranquility in articles and dictionaries.

### B. Admin Panel Content Publishing Suite
- **Article Publishing & Image Uploader**:
  - Dedicated "Prakaran Articles" management tab.
  - Form fields: Title, auto-slug generator, Category selector, Excerpt, Content editor (Markdown/Headings), Target Audience, and Read Time.
  - Image uploader: Direct device file upload with instant server upload (`/api/admin/media`), thumbnail preview, custom URL input, or one-click preset library.
- **Vastu Shabd Kosh & Terms Manager**:
  - Rebranded and enhanced "Vastu Shabd Kosh (Dictionary)" tab in Admin Panel.
  - Post new vocabulary terms with: English Term, Sanskrit Name (Devanagari/Transliteration), Entity/Term Category (Concept, Direction, Energy Zone, Deity, Shastra), Short Simple Definition, and Full Meaning.
  - Search, edit, and delete dictionary terms with instant synchronization to PostgreSQL / DataStore.

---

## 3. Technical Architecture & Component Mapping

### Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 src/App.tsx                                 │
│                                                                             │
│   currentPage === 'home'                                                    │
│      └─► <DivineBackground petalsEnabled={true} isHeroOnly={true} />        │
│   currentPage === 'article-detail' | 'gyan-kosh'                            │
│      └─► Petals paused / hidden automatically (Tranquil Reading Zone)       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        ▼                                                           ▼
┌───────────────────────────────┐           ┌────────────────────────────────┐
│   src/components/             │           │   src/components/              │
│   ArticleView.tsx             │           │   AdminPanel.tsx               │
│                               │           │                                │
│ - Line Measure: max-w-[70ch]  │           │ Tab 1: Prakaran Articles       │
│ - Leading: leading-[1.95]     │           │  - Title, Slug, Category, Body │
│ - Quiet Links (No Sparkles)   │           │  - Image Uploader & Preview    │
│ - Reading Focus Toggle        │           │                                │
│ - Zero Movement In Background │           │ Tab 2: Vastu Shabd Kosh Terms  │
│                               │           │  - Sanskrit name & Category    │
│                               │           │  - Simple definition & Details │
└───────────────────────────────┘           └────────────────────────────────┘
```

---

## Execution Steps

1. **Restrain Floating Petals (`DivineBackground.tsx` & `App.tsx`)**:
   - Add `isHomepage` prop to `DivineBackground.tsx` so petals render only when on the homepage hero area.
   - On article views, disable petal animations completely.
2. **Elevate Article Reading Typography (`ArticleView.tsx`)**:
   - Set prose container to optimal measure (`max-w-[70ch]` / `max-w-3xl mx-auto`).
   - Increase text leading to `leading-[1.95]`.
   - Remove inline `<Sparkles />` icons from `renderTextWithEntityLinks` to prevent visual jitter.
   - Include a one-click "Reading Focus" mode toggle at the top of articles.
3. **Enhance Admin Panel Publishing (`AdminPanel.tsx` & `admin/KeywordsManager.tsx`)**:
   - Ensure the Article Creator allows instant image uploading, thumbnail previewing, editing, and publishing.
   - Rebrand and enhance Canonical Entities into a prominent **"Vastu Shabd Kosh (Dictionary & Entities)"** manager with direct CRUD for terms, Sanskrit titles, and definitions.
4. **Verification & Testing**:
   - Verify with `compile_applet` and `lint_applet`.
   - Run the 35+ automated test suite (`npm test`).
   - Check responsiveness in both Light and Dark modes.
