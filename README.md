<div align="center">
  <img src="assets/icon.svg" alt="DevWell Pulse-in-orbit mark" width="80">
  <h1>DevWell</h1>
  <p>Your day. In motion.</p>
  <p>Everyday wellness for screen-heavy workdays.</p>
</div>

**DevWell 3.1 — Pulse** turns small healthy breaks into a practical daily routine. It works on mobile and desktop, installs to your home screen and keeps your personal logs on your device.

## Original Pulse design

An entirely new identity replaces the earlier sage/pastel UI: midnight surfaces, electric blue, lime actions, a new pulse symbol and self-hosted Space Grotesk. Every screen, form, menu and dialog uses this system, including the matching light appearance.

The homepage features an original generated pearlescent loop, live canvas orbits and particles, and pointer-responsive dimensional movement. Four floating controls show real water, movement, meal and sleep data. Animation respects the device and app motion preference, pauses offscreen, and stops when navigating away.

## Pulse 3.1 refinements

The original pulse-in-orbit logo and 38-icon Orbit set share rounded strokes and the app’s active palette. [Browse the icon gallery](https://vignesh-s-github.github.io/DevWell/assets/icons/preview.html) or reuse individual SVGs and the sprite in `assets/icons/`.

Meal logging uses four in-app radio cards instead of the operating system’s select popup. Touch, keyboard arrows, Home/End and screen reader states work together; meal suggestions retain their selected type. Navigation, routines, food, movement and insights share page reveals and feedback. Progress changes animate from their previous value. Decorative movement pauses offscreen and in hidden tabs. Device reduced motion and the app’s motion switch disable animation.

## What works

- **Today:** daily routine completion, water/food/movement/sleep snapshot and mood check-in.
- **Routine:** 13 editable activity windows, a one-hour lunch and weekday calendar export with reminders at each window's start. The original breakfast window starts before work.
- **Food:** water logging, meal notes and South Indian meal inspiration.
- **Move:** movement logging and eye, stretch, walk and breathing timers. A running timer survives reload and logs completed movement once.
- **Insights:** 7/14-day routine, water, movement and sleep charts, plus mood summaries, and a date picker for earlier logs.
- **Preferences:** personal goals, dark mode, installation help, optional open-app reminders, JSON backup/restore and a confirmed local-data reset.
- **Offline:** the app shell is cached after a successful online visit; logging remains available without a connection.

## Run locally

The app uses plain HTML, CSS and JavaScript with no runtime dependencies. Generate the installation PNGs from the SVG master once before serving:

```sh
npm install
npx playwright install chromium
npm run build:icons
python3 -m http.server 4173
```

Open `http://localhost:4173`. Use an HTTP server rather than opening `index.html` directly so the service worker and install features can work.

## Deploy to GitHub Pages

1. Create a GitHub repository, such as `DevWell`, and push this folder's contents to its `main` branch.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. The included **Deploy DevWell to GitHub Pages** workflow generates installation icons, tests the data model and browser flows, checks an installed-cache upgrade, packages only the app files and deploys the site. If needed, start it with **Actions → Deploy DevWell to GitHub Pages → Run workflow**.
4. Open the published link shown by the workflow or Pages settings. Install DevWell from your browser menu or Preferences.

The paths and service-worker scope are relative, so the app supports a repository project path without configuration. Future pushes to `main` run the deployment again. No deployment secret or personal token is needed; the workflow uses GitHub's scoped token.

GitHub's workflow guidance: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Data and reminders

- Logs are stored under `devwell-v2` in this browser's localStorage. Existing prototype `devwell-v1` logs migrate automatically on first load at the same origin.
- No analytics, account, cloud upload, third-party API or font request is made by the app.
- Storage belongs to the browser and hosted origin. Clearing site data, changing browsers or switching URLs does not transfer your logs. Download a backup first.
- Backups contain personal wellness logs as plain JSON. Keep them somewhere private. Restoring explicitly replaces this browser's data; it stops active timers.
- Exported calendar events use local, floating times. Import the `.ics` into your calendar once and choose its timezone. Repeated imports can create duplicates.
- App notifications are optional and checked while DevWell is open. Background timers can be throttled, so closed-app or exact-time reminders require your calendar. DevWell does not edit your calendar automatically.
- The app is a personal tracker, not a medical assessment or personalized nutrition plan.

## Validate

```sh
npm test
npm install
npx playwright install chromium
npm run build:icons
# Start a local HTTP server in a separate terminal, then:
npm run test:browser
npm run test:upgrade
```

The browser test covers logs, escaping user content, reload persistence, edited windows, one-hour lunch, goals, mood, sleep, timer resume and single completion, history, backup/restore, calendar export, theme, offline use, all five screens at 320/390/768/1440 pixels, and blocked storage. Use `BASE_URL` for a server hosting DevWell in a subdirectory and `CHROMIUM_EXECUTABLE_PATH` for a preinstalled browser.

## Source map

| File | Purpose |
| --- | --- |
| `index.html` | Accessible app shell |
| `styles.css` | Pulse visual system and responsive layout |
| `app.js` | Core actions, timers, backups and installation |
| `views.js` | Pulse screens, forms and dialogs |
| `icons.js` | Original 38-icon Orbit family and compatibility aliases |
| `motion.js` | Shared page reveals, progress feedback and visibility-aware motion |
| `assets/icons/` | Standalone SVGs, sprite and dark/light gallery |
| `scripts/build-icons.cjs` | Generate PWA PNGs from the SVG logo master |
| `pulse.js` | Homepage canvas animation and lifecycle |
| `model.js` | Data validation and prototype migration |
| `sw.js` | Versioned offline app cache |
| `manifest.webmanifest` | Installation metadata |
| `tests/` | Data tests and browser integration test |
| `.github/workflows/pages.yml` | GitHub Pages deployment |

When changing shell files, bump the cache version in `sw.js` and the resource query versions in `index.html` and `sw.js`. Returning users see a refresh notice; their local logs stay intact. The upgrade regression test checks an installed old cache against the new application at a project subpath.

## Artwork and type

Original Pulse artwork lives in `assets/art/pulse.webp`, with its prompt in `pulse-provenance.json`. Space Grotesk is self-hosted under the SIL Open Font License in `assets/fonts/SPACE-OFL.txt`. No external font, image or analytics service is contacted by the app.
