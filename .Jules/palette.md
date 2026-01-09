## 2024-05-23 - Unread Count Visibility & Broken Search
**Learning:** Users rely on unread counts to prioritize attention; plain text numbers blend in too much. Also, leaving non-functional search bars interactive creates "click rage".
**Action:** Use high-contrast Badges for unread counts and explicitly disable non-functional inputs.

## 2025-01-20 - Keyboard Shortcut Discovery
**Learning:** `aria-keyshortcuts` is a powerful but underused attribute that exposes keyboard shortcuts to screen readers, unlike `title` which is mouse-dependent.
**Action:** Whenever a keyboard shortcut is implemented (like Ctrl+Enter), explicitly declare it with `aria-keyshortcuts` on the interactive element.
