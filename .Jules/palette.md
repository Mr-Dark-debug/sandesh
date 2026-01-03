## 2024-05-23 - Keyboard Accessibility for Hover Actions
**Learning:** Hover-only actions (like "Archive" or "Delete" icon buttons) are invisible to keyboard users. Using `group-hover:flex` alone hides these critical actions from tab navigation.
**Action:** Always pair `group-hover:flex` with `group-focus-within:flex` to ensure actions appear when a keyboard user tabs into the container. Also, verify the container itself or children have clear focus indicators.

## 2024-05-22 - Keyboard Discoverability for Future Features
**Learning:** Native `disabled` attributes completely remove elements from the keyboard tab sequence, making "Coming Soon" features invisible to keyboard-only users.
**Action:** Use `aria-disabled="true"` with `tabIndex={0}` (or default for buttons) and prevent default click actions. This allows users to tab to the element and hear its state via screen readers (e.g., "Attach files, Coming soon, unavailable").

## 2024-05-24 - Dropdown Accessibility Roles
**Learning:** Custom dropdown implementations using simple `div`s lack semantic meaning for screen readers, making them difficult to navigate.
**Action:** When building custom dropdowns without a library, explicitly add `aria-haspopup="true"` and `aria-expanded` to the trigger, `role="menu"` to the container, and `role="menuitem"` to interactive children.
