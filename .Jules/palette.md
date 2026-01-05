## 2024-04-18 - External Link Indicators
**Learning:** Users often click "API Documentation" expecting an in-app view but get a new tab. Adding a visual `ExternalLink` icon and ensuring it is announced or visually distinct helps set expectations (Heuristic #2: Match between system and real world).
**Action:** Always append an external link icon to `target="_blank"` links in the navigation to reduce cognitive friction.

## 2024-05-23 - Dynamic Button States
**Learning:** When buttons replace their text content with a loading spinner (like "Send" -> [Spinner]), screen readers lose the accessible name, often announcing just "button". This leaves users unsure what the button does or its current state.
**Action:** Always use `aria-label` to provide a persistent, descriptive name (e.g., "Sending...") when the visual label is removed or obscured by a loading state.
