# Daily Rhythm validation

Validated locally on 27 November 2026 for the DevWell 2 redesign.

- JavaScript syntax checks pass for the core, redesigned views, data model and service worker.
- Six data-model tests cover safe defaults, real dates, existing prototype logs, backup validation, timer state and imported values.
- The browser integration suite covers water, meals and escaped user input; persistence; routine windows and a one-hour lunch; goals, mood, sleep and movement; timer resume, one-time completion and its captured date; history; backup/restore; calendar export; dark mode; animation preference persistence; routine filters; quick water logging; offline reload/logging; and unavailable-storage recovery.
- All five screens fit 320, 390, 768 and 1440 pixel widths without horizontal document overflow.
- The installed-app regression stages an older service worker and existing logs, then installs the new application at a GitHub-style project subpath. Logs, goals and theme survive. The complete new shell and stored entries remain available offline after the new worker activates.
- Desktop and mobile home screens, the four other mobile screens, dark mode, the logging sheet and the timer were captured and visually inspected. Generated imagery was decoded before the final capture.
- A mechanical scan identified undersized helper text and differences from the previous design documentation. Functional type was raised to at least 11px and the design tokens were rewritten for the approved whole-app redesign. Chart layout animation was removed.
- Original WebP artwork and the self-hosted Outfit font are included in the offline app shell.

## Practical limits

OS installation prompts and notification delivery depend on device/browser permission and were not validated on a physical phone. Open-app reminders may be delayed when backgrounded. Calendar export is tested as a file; no external calendar is changed. The application stores data on the current device and does not offer cloud or wearable sync.
