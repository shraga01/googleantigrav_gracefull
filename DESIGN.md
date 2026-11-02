# DESIGN.md: PastelCard UI System & Logical RTL/LTR Tokens

**Platform:** Daily Appreciation App (`daily-appreciation-app`)  
**Design System:** PastelCard System (Morning Calm & Nature Tones)  
**WCAG Compliance:** 2.1 AA (Contrast ratio > 4.5:1 for body, > 3:1 for large text)

---

## 1. PastelCard Color Palette & Semantics

The PastelCard design system uses low-saturation, organic tints paired with deep, high-contrast text to evoke calm, contemplative reflection without visual fatigue:

| Variant | Purpose & Clinical Mood | Background Tint | Border | High-Contrast Text |
| :--- | :--- | :--- | :--- | :--- |
| **Sage** | Grounding, Calm, Success (`Dosing`, `Streaks`) | `#F2F7F2` | `#D4E4D4` | `#203822` |
| **Lavender** | Reflection, Gratitude Letters, Empty Chair | `#F6F4FB` | `#E3DCFA` | `#32284C` |
| **Peach** | Warmth, Prosocial Connection, 3GT, GQ-6 | `#FFF6F0` | `#FCE1D0` | `#4A2D1E` |
| **Sky** | Clarity, Hedonic Reset, Mental Subtraction | `#F0F7FF` | `#D4E6FC` | `#16304C` |
| **Rose** | Empathy, Vulnerability, Close Relationships | `#FFF2F4` | `#FCDFE4` | `#4A1D23` |
| **Cream** | Neutral, Base Container, Secondary Stats | `#FAF8F5` | `#EAE3D6` | `#383028` |

---

## 2. Strict CSS Logical Properties Mapping

To support seamless switching between Hebrew (`dir="rtl"`) and English (`dir="ltr"`), all layout classes must use CSS logical properties:

```css
/* Margin & Padding */
margin-inline-start: ms-*   /* Replaces ml- in LTR and mr- in RTL */
margin-inline-end:   me-*   /* Replaces mr- in LTR and ml- in RTL */
padding-inline-start: ps-*  /* Replaces pl- in LTR and pr- in RTL */
padding-inline-end:   pe-*  /* Replaces pr- in LTR and pl- in RTL */

/* Text Alignment */
text-align: text-start      /* Replaces text-left in LTR and text-right in RTL */
text-align: text-end        /* Replaces text-right in LTR and text-left in RTL */

/* Borders & Positioning */
border-inline-start: border-s-*
border-inline-end:   border-e-*
inset-inline-start:  start-*
inset-inline-end:    end-*
```

---

## 3. Elevation & Corner Radius Tokens

* **Border Radius:** `rounded-2xl` (`1rem` / `16px`) for cards; `rounded-xl` (`0.75rem` / `12px`) for inputs; `rounded-full` for badges and primary CTAs.
* **Elevation:**
  - `shadow-xs`: Subtle inner depth for inputs (`0 1px 2px rgba(0,0,0,0.03)`).
  - `shadow-sm`: Rest state for PastelCards (`0 2px 4px rgba(74, 64, 54, 0.05)`).
  - `shadow-md`: Interactive hover elevation (`0 4px 12px rgba(74, 64, 54, 0.08)`).
  - `shadow-lg`: Modals and active completion cards (`0 8px 24px rgba(74, 64, 54, 0.12)`).

---

## 4. Typography Scale

* **Headings:** Outfit / Inter, bold or semibold, line-height 1.3.
* **Body:** Inter / system-ui, regular, line-height 1.6.
* **Literary/Letter Drafting:** Georgia / serif for Gratitude Letters to induce reflective pacing.
