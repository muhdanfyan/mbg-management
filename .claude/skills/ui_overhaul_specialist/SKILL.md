---
name: ui_overhaul_specialist
description: Expert skill for implementing premium, modern UI designs like the "TeamHub" UI Kit.
---
# UI Overhaul Specialist Skill

Use this skill to transform basic application interfaces into premium, modern SaaS dashboards following the "TeamHub" design language.

## Design System (TeamHub Principles)

### 1. Color Palette (Mint / Professional)
- **Primary:** `#2BBF9D` (Mint Green) - for primary actions, active states.
- **Secondary:** `#1A4D43` (Dark Emerald) - for sidebar, strong headings.
- **Accent:** `#E2F8F3` (Soft Mint) - for card backgrounds, subtle highlight.
- **Background:** `#F8FAF9` (Off-white Mint) - for main page background.

### 2. Glassmorphism & Depth
- **Effect:** Use `backdrop-blur-md bg-white/70 border border-white/20`.
- **Shadows:** Use soft, diffused shadows: `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`.
- **Corners:** Use large border radii: `rounded-2xl` (1rem) for cards, `rounded-3xl` (1.5rem) for main containers.

### 3. Layout Standards
- **Sidebar:** Clean, slim when collapsed, bold when expanded. Neutral icons with primary color on active.
- **Cards:** Modern data cards with iconography on the left and bold metrics on the right.
- **Tables:** Minimalist, no borders between columns, soft row highlights on hover.

## Core CSS Utility tokens (Add to index.css)
```css
:root {
  --primary: #2BBF9D;
  --primary-light: #E2F8F3;
  --secondary: #1A4D43;
  --bg-main: #F8FAF9;
}

.glass-card {
  @apply bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm;
}
```

## Implementation Steps
1. **Foundation:** Update `index.css` with the palette and utility classes.
2. **Layout:** Revamp `MainLayout` and `Sidebar` to use the mint palette and soft shadows.
3. **Pages:** Rebuild page headers (using breadcrumbs and clean titles) and convert existing cards to the "Glass Card" style.
4. **Interactive:** Ensure all buttons and inputs use the new rounded-xl/2xl style and mint accents.

## Verification
- Confirm all pages use the `#2BBF9D` primary color.
- Verify responsiveness of the new card layouts.
- Check accessibility (contrast) of white text on mint buttons.
