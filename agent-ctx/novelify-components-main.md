# Task: Create Four Novelify Components

## Task ID: novelify-components

## Summary
Created four Novelify components as specified:

### 1. Translation (`src/components/novelify/translation.tsx`)
- Literary translation workspace with two-panel layout (original + translation)
- Chapter selector via Select dropdown with translation status indicators
- Translate Chapter and Translate All buttons with loading states
- Progress bar for batch translation
- Translation quality info box
- Paper-like styled content areas with serif fonts
- "Select a project first" fallback with Go to Dashboard button
- Language name mapping included

### 2. Synopsis (`src/components/novelify/synopsis.tsx`)
- Back-Cover Blurb generator with Generate, Copy, Regenerate buttons
- Amazon Product Description generator with character count indicator
- Loading skeleton states during generation
- Paper-like styled result display
- "Select a project first" fallback
- POSTs to `/api/synopsis` with type and context

### 3. CoverGenerator (`src/components/novelify/cover-generator.tsx`)
- Current cover display with 3D book mockup (perspective, shadow, spine effect)
- Generate New Cover form with prompt textarea and style select
- Genre-based default prompts for common genres
- Generated cover preview with Use This Cover / Generate Another buttons
- Cover dimensions info (2560×1600px KDP recommendation)
- POSTs to `/api/cover` with prompt and style
- PATCHes project coverImage on save

### 4. EpubExport (`src/components/novelify/epub-export.tsx`)
- Pre-export checklist (chapters, content, translations, cover, genre)
- Ready/Not Ready status badge
- Export settings: include original, include translation, author name, book language
- Generate EPUB button with spinner state
- Download link on completion
- Export history list
- POSTs to `/api/export` with options

## Design System Applied
- Primary: Amber #C8873A, Dark: #0D0D0D, Light: #F7F3EC
- All components use 'use client' directive
- shadcn/ui components (Card, Button, Badge, Select, etc.)
- Lucide icons throughout
- framer-motion animations
- Responsive layouts (grid cols-1 on mobile, cols-2 on desktop)
- Custom scrollbar styling
- Paper-like backgrounds (#FFFDF7) for content areas

## Lint Status
✅ All lint errors fixed (React hooks order issue resolved by moving useCallback before early returns)
