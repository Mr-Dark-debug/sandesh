## 2024-05-23 - Keyboard Accessibility for Hover Actions
**Learning:** Hover-only actions (like "Archive" or "Delete" icon buttons) are invisible to keyboard users. Using `group-hover:flex` alone hides these critical actions from tab navigation.
**Action:** Always pair `group-hover:flex` with `group-focus-within:flex` to ensure actions appear when a keyboard user tabs into the container. Also, verify the container itself or children have clear focus indicators.

## 2024-06-03 - Accessible "Coming Soon" Buttons
**Learning:** Using the native `disabled` attribute removes elements from the keyboard tab order, making them invisible to screen reader users who might need to know about future features.
**Action:** For discoverable but disabled features, use `aria-disabled="true"` combined with `onClick={(e) => e.preventDefault()}` and visual styling (`cursor-not-allowed`, gray text) instead of the `disabled` attribute. This keeps the element focusable and announced as disabled.
