# 🧪 DevWell validation

GitHub Actions validates every release before publishing the production artifact.

## Setup

```sh
npm install
npx playwright install chromium
npm run build:icons
npm test
npm run serve
```

With the HTTP server running, execute the browser suites in another terminal. Set `BASE_URL` for a different origin/project path and `CHROMIUM_EXECUTABLE_PATH` for an installed browser.

| Command | Coverage |
| --- | --- |
| `npm test` | Pure validation, retention, notifications, haptics, timer, activity/Undo and stretch rules |
| `npm run test:browser` | Logs, forms, escaping, keyboard controls, persistence, backups, calendar, theme, offline and responsive screens |
| `npm run test:haptics` | Action hooks, activation/visibility guards, once-only cues and device fallbacks |
| `npm run test:move` | Activity rings, fractional pause/resume, breathing phases and responsive timers |
| `npm run test:notifications` | Opt-in permissions, worker delivery, categories, deduplication, click routing and fallback states |
| `npm run test:retention` | 365-day boundaries, daily cleanup, long closures, restore/export, cross-tab updates and offline startup |
| `npm run test:animations` | Steady tab changes, actual artwork animation, phase continuity, visibility pause and reduced motion |
| `npm run test:features` | Three goal celebrations, reload-safe receipts, field-safe/captured-date Undo, expiry/focus, modal feedback, guided stretch steps/cues/credit and responsive layouts |
| `npm run test:upgrade` | Installed old-cache upgrade at a GitHub Pages subpath while preserving logs and offline access |

## Important checks

- Undo must never roll back another field, recreate expired history, overwrite a changed field or restart a completed timer.
- Crossing a goal celebrates once per stored day/category, including after Undo, reload and backup normalization.
- Stretch text, pose, hold/relax cues and rings derive from the existing absolute timer target. Pause/reload/closed panels preserve the same step.
- Hidden pages and disabled haptics do not replay missed stretch or breathing cues.
- Stopping a partial guided stretch adds no minutes; completion credits once on the retained start date.
- Reduced visual animation keeps goal status, Undo controls, text, countdown and independently enabled haptics available.
- No page/card entry transform may reintroduce the tab-switch wiggle.
- Mobile layouts and native dialogs must fit their viewport; both themes are captured for the new guide.

Screenshots are written to `test-results/` and retained in the workflow’s screen-preview artifact. Mocks verify browser API integration; physical phone vibration, notification presentation and installation prompts still require the actual device/browser.
