## 2024-05-23 - Form Accessibility Fundamentals
**Learning:** Even well-styled forms can fail basic accessibility checks if labels aren't programmatically associated with inputs. Visually placing a label next to an input isn't enough for screen readers.
**Action:** Always use `htmlFor` on labels and matching `id` on inputs, or use `aria-label` when a visible label isn't desirable. Verify by clicking the label text - it should focus the input.
