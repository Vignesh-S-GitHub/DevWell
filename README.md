<div align="center">
  <img src="assets/icon.svg" alt="DevWell leaf mark" width="80">
  <h1>DevWell</h1>
  <p>Find your daily rhythm.</p>
  <p>Everyday wellness for screen-heavy workdays.</p>
</div>

**DevWell 2 — Daily Rhythm** turns small healthy breaks into a practical daily routine. It works on mobile and desktop, installs to your home screen and keeps your personal logs on your device.

## New in Daily Rhythm

- Original 3D wellness and South Indian breakfast artwork, optimized to lightweight WebP assets.
- A desktop sidebar and mobile bottom navigation, with a global activity logging sheet.
- One-tap water and movement logs, smarter upcoming activities, routine filters and recent dates.
- Meal suggestion chips and pre-filled inspiration cards; you always confirm before saving.
- Guided timer screens, gentle breathing cues, water motion and completion feedback.
- Metric switching and 7/14-day views of your actual routine, water, movement and sleep history.
- A complete dark theme and a persisted animation switch that also respects reduced motion.
- Versioned shell resources to keep installed-app upgrades consistent with existing stored data.

## What works

- **Today:** daily routine completion, water/food/movement/sleep snapshot and mood check-in.
- **Routine:** 13 editable activity windows, a one-hour lunch and weekday calendar export with reminders at each window's start. The original breakfast window starts before work.
- **Food:** water logging, meal notes and South Indian meal inspiration.
- **Move:** movement logging and eye, stretch, walk and breathing timers. A running timer survives reload and logs completed movement once.
- **Insights:** 7/14-day routine, water, movement and sleep charts, plus mood summaries, and a date picker for earlier logs.
- **Preferences:** personal goals, dark mode, installation help, optional open-app reminders, JSON backup/restore and a confirmed local-data reset.
- **Offline:** the app shell is cached after a successful online visit; logging remains available without a connection.

## Run locally

No build step or runtime dependencies are needed to use the app.

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173`. Use an HTTP server rather than opening `index.html` directly so the service worker and install features can work.

## Deploy to GitHub Pages

1. Create a GitHub repository, such as `DevWell`, and push this folder's contents to its `main` branch.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. The included **Deploy DevWell to GitHub Pages** workflow tests the data model, packages only the app files and deploys the site. If needed, start it with **Actions → Deploy DevWell to GitHub Pages → Run workflow**.
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
# Start a local HTTP server in a separate terminal, then:
npm run test:browser
npm run test:upgrade
```

The browser test covers logs, escaping user content, reload persistence, edited windows, one-hour lunch, goals, mood, sleep, timer resume and single completion, history, backup/restore, calendar export, theme, offline use, all five screens at 320/390/768/1440 pixels, and blocked storage. Use `BASE_URL` for a server hosting DevWell in a subdirectory and `CHROMIUM_EXECUTABLE_PATH` for a preinstalled browser.

## Source map

| File | Purpose |
| --- | --- |
| `index.html` | Accessible app shell |
| `styles.css` | Prototype's visual system and responsive layout |
| `app.js` | Core actions, timers, backups and installation |
| `views.js` | Daily Rhythm screens and interactions |
| `model.js` | Data validation and prototype migration |
| `sw.js` | Versioned offline app cache |
| `manifest.webmanifest` | Installation metadata |
| `tests/` | Data tests and browser integration test |
| `.github/workflows/pages.yml` | GitHub Pages deployment |

When changing shell files, bump the cache version in `sw.js` and the resource query versions in `index.html` and `sw.js`. Returning users see a refresh notice; their local logs stay intact. The upgrade regression test checks an installed old cache against the new application at a project subpath.

## Artwork and type

Original artwork lives in `assets/art/`, with generation prompts in `provenance.json`. Outfit is self-hosted under the SIL Open Font License in `assets/fonts/OFL.txt`. No external font, image or analytics service is contacted by the app.
