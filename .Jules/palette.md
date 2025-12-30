## 2025-05-24 - Accessibility Gaps in Placeholders
**Learning:** Placeholder UI elements (like "coming soon" buttons) often lack accessibility attributes, making them confusing for screen reader users who perceive them as broken or unlabeled controls.
**Action:** Always add `aria-label` to placeholder buttons, even if they are non-functional, or explicitly mark them as disabled/hidden if they shouldn't be interactable.

## 2025-05-27 - Honest UI Over "Broken" UI
**Learning:** Leaving non-functional buttons (like the formatting tools in Compose) as clickable elements creates a "broken" experience where users think the app is buggy.
**Action:** Explicitly disable future features with clear `cursor-not-allowed` styles and "Coming soon" tooltips. This transforms a "bug" into a "roadmap promise."

## 2025-05-28 - Focus Visibility in Forms
**Learning:** Default browser focus rings can be jarring or invisible depending on the OS/Browser combination. However, completely removing them (`outline: none`) without adding a custom focus state destroys accessibility for keyboard users.
**Action:** When using `outline-none`, always replace it with a clear visual indicator like `focus-within:bg-color` or `ring` on the container element to maintain context and accessibility.

## 2025-10-26 - Form Error Accessibility
**Learning:** Simply displaying an error message visually is insufficient for screen reader users, who may not be aware that an input field is invalid or where the error description is located.
**Action:** Always link form inputs to their error messages using `aria-invalid="true"` and `aria-describedby="[error-id]"` to ensure the error context is programmatically associated with the control.

## 2025-10-27 - Keyboard Shortcut Safety
**Learning:** Implementing keyboard shortcuts like `Ctrl+Enter` to bypass button clicks must strictly mirror the validation logic of the button itself. Bypassing disabled states can lead to duplicate submissions or empty data errors.
**Action:** Always wrap shortcut handlers in the same guard clauses (e.g., `if (!loading && isValid)`) used by the primary action button.
