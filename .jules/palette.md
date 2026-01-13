# Palette's Journal

## 2024-05-22 - Missing Toast Feedback Pattern
**Learning:** `ComingSoonButton` provides `aria-disabled="true"` but lacks active feedback (like a toast) when clicked, leaving users unsure if the click registered or if the feature is just broken.
**Action:** Enhance `ComingSoonButton` or similar "disabled-but-interactive" elements to provide explicit "Feature coming soon" feedback via Toast, rather than silently preventing default behavior.