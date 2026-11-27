# DevWell

A personal wellness companion for software engineers and other people with screen-heavy workdays.

## Product truth

The user supplied a mobile DevWell prototype and asked to turn it into an actual web app hosted on GitHub. Its existing name, leaf mark, forest/sage palette, pastel health categories and five-screen navigation are the visual authority. This implementation extends that prototype rather than replacing its identity.

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

The first release is a personal device app rather than a multi-user service. No cloud sync, wearable integration, automatic calendar changes or background scheduled push service has been requested. GitHub repository creation and Pages setup remain pending until browser sign-in or an existing destination repository is provided.
