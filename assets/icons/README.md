# DevWell Orbit

38 original icons drawn for DevWell Pulse. Each uses a 24 × 24 viewBox, 1.75px rounded strokes, open negative space, and currentColor. The pulse-in-orbit logo connects everyday health with the homepage orbital sculpture.

- Single icons: SVG files in this folder.
- Sprite: `sprite.svg#water`, for example.
- Runtime source: `../../icons.js`; aliases leaf → pulse and chevron → arrow keep saved routines compatible.
- Brand master: `../brand/logo.svg`; app icon: `../brand/app-icon.svg`.
- Gallery: `preview.html`, with dark and light previews.

Use 20–24px for navigation, 24–32px for actions, and 40–48px for illustration. Preserve strokes and viewBox. Decorative application icons have aria-hidden; actionable controls carry text or accessible names. The SVG artwork was created for this project; no third-party icon library is required.

PNG installation icons are generated from the SVG master by `npm run build:icons` during deployment.
