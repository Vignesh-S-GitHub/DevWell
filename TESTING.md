# Pulse validation

The original Pulse interface replaces the previous visual system completely. Its five screens, light appearance and preferences dialog were captured and inspected at mobile and desktop sizes.

- Six data-model tests cover safe defaults, dates, existing logs, imported backups and timer state.
- Browser integration covers all health logs, escaping user input, persistence, routine editing, the one-hour lunch, timers, history, backup/restore, calendar export, theme, motion preference, filters and unavailable storage.
- The homepage canvas is tested by comparing actual successive rendered frames, rather than simply checking for an animation class.
- Every screen is checked for horizontal overflow at 320, 390, 768 and 1440 pixels. A narrow-screen movement-meter issue was corrected.
- The installed-cache upgrade regression verifies that earlier logs, goals and theme data remain available in the complete new offline application at a project subpath.
- Animation is bounded to the homepage. Resize/intersection observers, route cleanup and hidden-document handling stop unnecessary frame work. Reduced motion uses a static canvas.

OS installation prompts and notification delivery still depend on the user's device/browser permissions. Reminders require the open app; the calendar export is the separate option for scheduled reminders. Data remains local, without cloud or wearable sync.
