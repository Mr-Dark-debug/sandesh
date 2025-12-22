## 2024-05-22 - Login Accessibility & Feedback
**Learning:** Even "clean" grouped input designs (like iOS style) create accessibility barriers when labels are omitted for aesthetics. `placeholder` is not a replacement for `<label>`.
**Action:** Always add `sr-only` labels to grouped inputs to maintain design intent while ensuring screen readers can announce the field purpose. Also, login forms without loading states create "dead clicks" feeling - essential to feedback loop.
