---
name: Daily Appreciation Design System
description: Guidelines and reusable patterns for the Daily Appreciation App's UI, focusing on Glassmorphism, Gradient backgrounds, and Hebrew/RTL support.
---

# UI Design System - Daily Appreciation App

## 1. Core Aesthetic
- **Visual Style**: Modern Glassmorphism over vibrant gradients.
- **Direction**: RTL (Hebrew) primary, LTR supported. 
- **Framework**: TailwindCSS with custom configuration.

## 2. Color Palette (`tailwind.config.js`)
### Gradients
- **Primary Background**: `bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500` (or similar vibrant mix).
- **Glass Effects**: 
  - Surface: `bg-white/10 backdrop-blur-lg border border-white/20`
  - Deep Surface: `bg-black/20` or `bg-white/5`

### Named Colors
- **Soft Cream**: `#FDFBD4`
- **Soft Lilac**: `#E6DFF0`
- **Sage Border**: `#C0D0B0`
- **Sage Fill**: `#F6F8F2`
- **Olive Btn**: `#A0B098` (Buttons)
- **Streak Gold**: `#E2C78E` / `#DBC695` (Pills/Highlights)
- **Alert/Success**: `#10b981` (Green/Quality)
- **Primary Action**: `#3b82f6` (Blue/Consistency)
- **Growth/Energy**: `#f59e0b` (Amber/Orange)

## 3. Typography
- **Headings**: `Playfair Display` (Serif, Elegant) - Used for Titles.
- **Body**: `Rubik` (Sans-serif, Clean) - Optimized for Hebrew.

## 4. Reusable Component Patterns

### A. Glass Cards (Containers)
Used for the main content areas (History, Daily Input).
```tsx
<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
  {/* Content */}
</div>
```

### B. Headers
Centered text with potential navigation elements.
```tsx
<h3 className="text-xl font-bold text-white text-center shadow-sm">
  Title Here
</h3>
```

### C. Stats Dashboard (Horizontal)
Use Flexbox for side-by-side stats on mobile/desktop. Avoid rigid Grids for fluid content.
```tsx
<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: '16px' }}>
  <div className="flex flex-col items-center flex-1">
    {/* Circular Progress */}
    <span>Label</span>
  </div>
   {/* ... repeat ... */}
</div>
```

### D. Grids (Calendar/Badges)
Use explicit inline styles for grids to ensure robustness against CSS purging or direction issues.
```tsx
<div 
  style={{
    display: 'grid', 
    gridTemplateColumns: 'repeat(7, 1fr)', // Adjust column count
    gap: '8px',
    direction: isHebrew ? 'rtl' : 'ltr'
  }}
>
  {/* Grid Items */}
</div>
```

## 5. Animation
- **Transitions**: `transition-all duration-200`
- **Hover Effects**: `hover:scale-105 hover:bg-white/20`
- **Loading/Entry**: `animate-fadeIn`, `animate-slideUp`

## 6. Iconography
- Use simple emojis or minimal SVG icons (Circles, Checks).
- **Streak**: 🔥
- **Qaulity**: ⭐ (High) / ✅ (Normal)
- **Locked**: 🔒

## 7. Implementation Rules
1. **Always check `isHebrew`** for text alignment and logical ordering.
2. **Mobile First**: Design for touch targets (min 44px buttons).
3. **Contrast**: Ensure white text is readable on the gradient (use `text-white` or `text-white/80`).
