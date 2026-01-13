## 2024-05-23 - Unread Count Visibility & Broken Search
**Learning:** Users rely on unread counts to prioritize attention; plain text numbers blend in too much. Also, leaving non-functional search bars interactive creates "click rage".
**Action:** Use high-contrast Badges for unread counts and explicitly disable non-functional inputs.
<<<<<<< HEAD
## 2024-05-23 - Visual Keyboard Hints
**Learning:** Visual keyboard shortcut hints (like 'Ctrl+Enter') should be implemented with platform detection to show the correct key (Cmd vs Ctrl), marked with `select-none` to prevent accidental selection, and hidden from screen readers (`aria-hidden='true'`) to avoid redundancy with the button's `aria-keyshortcuts` or `title`.
**Action:** Use the `navigator.platform` check (wrapped in safety checks) to render the correct symbol, and pair the visual hint with `aria-keyshortcuts` on the interactive element.
=======

## 2024-12-07 - Accessible Custom Menus
**Learning:** Custom dropdown implementations often trap keyboard users if they don't manage focus. Auto-focusing the first item and handling Arrow/Escape keys transforms a "broken" widget into a native-feeling control.
**Action:** Always implement full keyboard navigation (Arrows + Escape) for custom interactive menus, not just click handlers.
>>>>>>> e4d53f4d8ec11f91d2719e40fb4114fe8c40c867
