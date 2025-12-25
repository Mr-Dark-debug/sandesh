## 2025-05-24 - Accessibility Gaps in Placeholders
**Learning:** Placeholder UI elements (like "coming soon" buttons) often lack accessibility attributes, making them confusing for screen reader users who perceive them as broken or unlabeled controls.
**Action:** Always add `aria-label` to placeholder buttons, even if they are non-functional, or explicitly mark them as disabled/hidden if they shouldn't be interactable.
