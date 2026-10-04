# Sentence Builder feedback and responsive mobile UX

## Goal
Keep every submitted builder answer on screen until the learner explicitly continues, present clear premium feedback, and make every app screen usable on mobile and tablet—including while the virtual keyboard is open.

## Changes

### 1. Sentence Builder answer flow
- Separate “check answer” from “advance question” so submission only reveals feedback and never changes the task.
- Lock word choices after checking to preserve the submitted answer and avoid accidental changes beneath the feedback.
- Show an integrated feedback banner:
  - correct: soft green `#2e4a3b`, success icon, concise confirmation;
  - incorrect: soft burgundy `#4a2e2e`, submitted answer, correct answer, and a clearly separated grammar explanation.
- Show `Следующее задание` only after feedback appears; advance and reset builder state only when it is pressed.
- Keep `Попробовать снова` for incorrect answers, with the next-question action remaining explicit.

### 2. Mobile navigation and page frame
- Replace the crowded horizontally scrolling mobile navigation with a compact header and accessible slide-out menu containing all destinations, account identity, and sign-out.
- Preserve the fixed desktop sidebar, while using dynamic viewport height and safe-area spacing on phones and tablets.
- Prevent horizontal page overflow and reduce page/card spacing and heading sizes at narrow widths.

### 3. Responsive screens and controls
- Make multi-item headers, action rows, status rows, and card headings shrink or stack cleanly without clipped text.
- Make buttons full-width where needed on small phones while retaining compact desktop layouts.
- Keep tables usable with deliberate horizontal scrolling, minimum column widths, and visible scroll boundaries.
- Adjust dashboard statistics, charts, level cards, placement test controls, errors, essay editor/results, rules, and Gemini settings for phone and tablet widths.
- Ensure long labels, email addresses, grammar examples, and generated feedback wrap safely.

### 4. Virtual keyboard behavior
- Use dynamic viewport sizing and keyboard-aware viewport metadata so the visible page resizes instead of being pushed off-screen.
- Keep form fields at a mobile-safe font size, add focus scroll spacing, and ensure focused inputs/textareas remain reachable above the keyboard.
- Avoid fixed-height form containers and preserve vertical scrolling while editing login, retake, search, API key, and essay fields.

### 5. Verification
- Check the builder flow end-to-end: submit correct and incorrect answers, verify feedback remains, then advance manually.
- Test all routes at small phone, standard phone, tablet, and desktop widths.
- Test keyboard-focused forms and confirm no horizontal overflow, clipped controls, overlapping text, or inaccessible actions.
- Confirm the latest app build and browser console are clean.

## Technical details
- Reuse the existing dark design tokens and shared controls; add semantic feedback surface tokens for the exact requested colors.
- Use responsive grid patterns with `minmax(0,1fr)`, `min-w-0`, `shrink-0`, and narrow-screen stacking.
- Use `100dvh`, safe-area environment insets, `scroll-margin`, and `interactive-widget=resizes-content` for mobile keyboard resilience.
