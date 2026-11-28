# DevWell

A personal wellness companion for software engineers and other people with screen-heavy workdays.

## Product truth

The user explicitly requested an original visual identity and complete UI replacement after rejecting the previous redesign for retaining its existing theme. DevWell Pulse therefore replaces the sage/pastel/clay design, leaf identity, typography, composition and navigation. The new system uses midnight/electric blue/lime, a pulse mark, Space Grotesk, original loop artwork and subtle in-place animated line instruments.

Users log water, meals, movement, sleep and mood; complete a flexible weekday routine; run guided break timers; and review recent history. Routine windows are editable and lunch lasts one hour. The supplied prototype includes a 9 AM breakfast before its 10 AM–7 PM workplace routine.

## Delivery and constraints

- Static HTML/CSS/JavaScript, deployable at any GitHub Pages project subpath.
- Installable PWA with offline shell and browser-local storage. No account, backend or paid API.
- Personal data stays in the browser. Explicit JSON download/restore supports manual transfers.
- Reminders require opt-in notification permission and an open app. Calendar export provides weekday recurring time windows for a calendar application.
- Timers survive reload and credit movement on the date they started.
- Keep the mobile layout primary, with a wider desktop adaptation and keyboard accessibility.
- Health goals are editable preferences, and food suggestions are illustrative rather than medical recommendations.

## Assumptions

The first release is a personal device app rather than a multi-user service. No cloud sync, wearable integration, automatic calendar changes or background scheduled push service has been requested. The destination is `Vignesh-S-GitHub/DevWell`. Source has been uploaded. GitHub Pages is enabled with GitHub Actions. The app is published at https://vignesh-s-github.github.io/DevWell/.


## Pulse redesign

Quick actions support one-tap water/movement entries and a global logging sheet. Routine filters and recent dates shorten navigation. Meal suggestions pre-fill a form. Insights switch between actual routine/water/movement/sleep values over 7 or 14 days. Animation preferences persist and respect the operating system. Versioned shell assets allow existing installations to upgrade without mixing old scripts with the new views.


Pulse introduces a new default dark appearance once, while preserving health data and goals. Subsequent dark/light preferences persist within the new system. All screens and controls share that theme. Animations pause offscreen and on hidden tabs; device reduced motion and the persistent Gentle animations preference stop nonessential effects. The user clarified that only the tab-switch wiggle should be removed. Keep page layouts, headings and cards steady on navigation while artwork remains alive: a spinning home loop, flowing/bubbling water, orbiting reset markers, repeated Routine linework and animated Insights instruments. Preserve functional data progress, activity-ring pulses and the 4/6 breathing guide. Decorative artwork must not change recorded values.
