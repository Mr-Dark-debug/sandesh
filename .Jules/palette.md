## 2024-05-23 - Keyboard Accessibility for Hover Actions
**Learning:** Hover-only actions (like "Archive" or "Delete" icon buttons) are invisible to keyboard users. Using `group-hover:flex` alone hides these critical actions from tab navigation.
**Action:** Always pair `group-hover:flex` with `group-focus-within:flex` to ensure actions appear when a keyboard user tabs into the container. Also, verify the container itself or children have clear focus indicators.
