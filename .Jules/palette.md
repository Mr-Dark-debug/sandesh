## 2025-05-24 - Accessibility Gaps in Placeholders
**Learning:** Placeholder UI elements (like "coming soon" buttons) often lack accessibility attributes, making them confusing for screen reader users who perceive them as broken or unlabeled controls.
**Action:** Always add `aria-label` to placeholder buttons, even if they are non-functional, or explicitly mark them as disabled/hidden if they shouldn't be interactable.

## 2025-05-27 - Honest UI Over "Broken" UI
**Learning:** Leaving non-functional buttons (like the formatting tools in Compose) as clickable elements creates a "broken" experience where users think the app is buggy.
**Action:** Explicitly disable future features with clear `cursor-not-allowed` styles and "Coming soon" tooltips. This transforms a "bug" into a "roadmap promise."
