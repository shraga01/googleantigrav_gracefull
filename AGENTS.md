# AGENTS.md: Architecture, Engineering Laws & Orchestration Protocol

**Platform:** Daily Appreciation App (`daily-appreciation-app`)  
**Source Repository:** `shraga01/googleantigrav_gracefull`  
**Firebase Project:** `daily-appreciation-app-275bf` (`daily-appreciation-app`)  
**Lead Engine:** Gemini 4 Argon / Gemini 3.8 Flash

---

## 1. Core Engineering Laws (Ironclad)

### 1.1 The 3-Branch Git Hierarchy
* `main`: Production environment (Strictly Read-Only. Direct commits are forbidden).
* `dev`: Integration / Staging (Branch off only from here).
* `feat/`, `fix/`, `chore/`: Isolated execution sandboxes (e.g., `feat/bilingual-rebuild`). All work must happen here.

### 1.2 Zero-Trust & Server-Side Authority
* Client bundles must never contain generative API keys or database admin keys.
* All live data must reside in Firebase Firestore with user-level security rules (`/users/{userId}/**`).
* Mock data or theoretical assumptions are forbidden in live user flows. If it does not exist in Firestore, it does not exist in the platform.

### 1.3 React Execution Order (Temporal Dead Zone Prevention)
* Every `useState` declaration and `useCallback` hook must appear physically ABOVE any `useEffect` hook that references it.
* Lazy state initialization (`useState(() => initialValue)`) must be used for cached stores to prevent cascading synchronous render warnings.

### 1.4 Vertex AI & Genkit Payload Cleanliness
* **Global Routing:** All Gemini 3.x / 4.x models MUST explicitly configure `location: 'global'` (Never `us-central1`).
* **Reasoning Control:** Use `thinking_level: 'medium'` (standard interactive coding/validation) or `'high'` (clinical narrative synthesis).
* **Payload Cleanliness:** NEVER include `thinking_budget` or custom sampling parameters (`temperature`, `top_p`, `top_k`).

---

## 2. Clinical Neuroscience Protocols

1. **Seligman Three Good Things (3GT) with Mandatory Causal Reflection:**
   - Active ingredient: `causalReflection` (Agency Attribution). The user must answer: *"Why did this happen? What was my personal role, choice, or condition?"*
   - Includes 1-7 Likert rating for emotional relief and elevation (`affectRating`).
2. **Dosing Schedule & Hedonic Adaptation Buffer:**
   - Phase 1 (`onboarding_daily_21`): 21 consecutive days of daily practice for medial prefrontal cortex (mPFC) neuroplasticity.
   - Phase 2 (`maintenance_variety`): 2-3 times per week with rotating lenses and angles to prevent hedonic adaptation and emotional fatigue.
3. **Longitudinal GQ-6 Assessment (McCullough et al.):**
   - 6-item validated questionnaire rated 1-7, tracking baseline (T1), midpoint (T2), and maintenance (T3). Items 3 and 6 are reverse-scored (`8 - score`).
4. **Empty Chair 3-Position Virtual Gratitude Visit:**
   - Position 1: Self Expressing (reading letter to visualized person).
   - Position 2: Other Responding (embodying recipient in empty chair, vocalizing response).
   - Position 3: Self Integration (returning to self, anchoring somatic relief and vagal regulation).
5. **Huberman Narrative Recall:**
   - Recalling a specific memory of receiving genuine gratitude to activate mPFC and autonomic parasympathetic pathways.

---

## 3. Bilingual & Logical CSS Engineering

* **Strict Bilingual Support:** Seamless bilingual support for Hebrew (`he`, RTL) and English (`en`, LTR).
* **Logical Properties Only:** In Tailwind CSS, only logical CSS properties are permitted:
  - `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`, `border-s`, `border-e`, `start-*`, `end-*`.
  - Physical directional classes (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `text-left`, `text-right`) are blocked by `scripts/verify-logical-css.js`.

---

## 4. Verification Harness Commands

Run before any PR or merge:
```bash
npm run lint          # ESLint 9 & React 19 rules (0 errors, 0 warnings)
npx tsc -b            # TypeScript strict compilation (0 errors)
npm run verify:css    # Logical CSS verifier (0 physical directionals)
npm run build         # Full production build (Vite / Next.js)
```
