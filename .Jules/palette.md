## 2024-05-23 - Unread Count Visibility & Broken Search
**Learning:** Users rely on unread counts to prioritize attention; plain text numbers blend in too much. Also, leaving non-functional search bars interactive creates "click rage".
**Action:** Use high-contrast Badges for unread counts and explicitly disable non-functional inputs.

## 2024-12-07 - Accessible Custom Menus
**Learning:** Custom dropdown implementations often trap keyboard users if they don't manage focus. Auto-focusing the first item and handling Arrow/Escape keys transforms a "broken" widget into a native-feeling control.
**Action:** Always implement full keyboard navigation (Arrows + Escape) for custom interactive menus, not just click handlers.
