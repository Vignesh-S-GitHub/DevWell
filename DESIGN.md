---
name: DevWell — Daily Rhythm
description: A warm, tactile wellness workspace with purposeful motion.
colors:
  primary: "#365e4c"
  background: "#f5f3ed"
  surface: "#fffefa"
  ink: "#25342e"
  muted: "#5f6b60"
  line: "#e4e6dd"
  mint: "#e4ecdf"
  mint-strong: "#c9e0b4"
  hero: "#e9eee3"
  water: "#e5edf1"
  water-ink: "#315e76"
  movement: "#e9eddb"
  movement-ink: "#4a6340"
  food: "#f7e7d8"
  food-ink: "#885c3d"
  recovery: "#ede9f3"
  recovery-ink: "#6a597e"
  accent: "#bf6b48"
  dark-background: "#19231f"
  dark-surface: "#24322b"
  dark-ink: "#f2f2e9"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "clamp(30px, 3.2vw, 42px)"
    fontWeight: 550
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "11px"
rounded:
  control: "12px"
  panel: "18px"
  feature: "22px"
  dialog: "25px"
spacing:
  compact: "8px"
  group: "16px"
  panel: "24px"
  section: "30px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    padding: "11px 19px"
    height: "46px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "22px"
---

# Design System: DevWell

## Overview

Daily Rhythm is a warm, tactile personal wellness workspace. The user explicitly requested a whole-app redesign with modern visuals, original generated artwork, useful animation and easier daily interactions. Keep DevWell's recognizable leaf mark and gentle green character, while replacing the narrow prototype composition with a responsive application layout.

Original clay illustrations provide personality. Data graphics, SVG icons and controls stay crisp and functional. Artwork is decorative; it never contains a number, instruction or interactive control that needs to be read.

## Colors

Forest green identifies actions and selected states. Warm off-white is the light-mode ground. Water, movement, food and recovery each have a distinct pastel surface with a matching dark foreground. The dark theme uses quieter tinted category surfaces and lighter matching text rather than retaining bright light-mode panels.

Use the CSS variables as the source of truth. Highlight routine completion with filled segments. Color always accompanies text, a selected state or a labeled icon.

## Typography

Outfit is self-hosted under the SIL Open Font License. Rounded forms connect the interface to its tactile artwork, while variable weights establish hierarchy without excessive bolding. Page headings use a fluid scale; health values and timer numerals use tabular spacing. Functional labels have an 11px floor. Longer explanations use a readable body scale and a maximum measure of 65 characters.

## Layout

- Desktop uses a persistent left navigation and a roomy content canvas, within a 1600px maximum shell. Sidebar width steps from 236px to 200px to 168px.
- At 699px and below, the shell becomes a centered mobile layout up to 560px wide, with five bottom navigation destinations and safe-area padding.
- The home screen combines an illustrated recharge surface, actual daily routine completion, quick logging, category summaries, upcoming activities and mood check-in.
- Food, movement and insights have distinct structures suited to their tasks. Routine windows form a chronological timeline with filters and a recent-day strip.
- Desktop dialogs are centered. Mobile dialogs are bottom sheets with a visible handle and close control. Forms remain scrollable inside the viewport.

## Elevation & Depth

Most surfaces use a fine border or tonal layering. Soft neutral shadows belong to dialogs and transient feedback. The original generated artwork carries its own natural material shading. Avoid decorative glowing shadows and stacked nested panels.

## Shapes

Controls are rounded and tactile. Primary actions use a pill silhouette; panels usually use 18px corners, larger illustrated surfaces 22px, and dialogs 25px with a 26px mobile top edge. Small pictograms use extended hit areas where their visible shape is compact.

## Components

- **Navigation:** five named destinations; selected desktop rows use mint fill, while mobile uses a small icon capsule. Preferences remain available from the header on all devices.
- **Health tiles:** actual numeric data, relevant graphic and immediate logging action. Water fill and movement arcs encode saved progress.
- **Routine timeline:** local time windows, activity description and reversible completion control. A full hour remains reserved for lunch. Filters never remove saved data.
- **Meal logging:** meal type, note and optional suggestion chips. A suggestion pre-fills the form; it never saves an entry automatically.
- **Timers:** a real countdown, actual completion arc, start/pause/reset and a persistent state. Breathing uses a gentle expanding circle with cues; discomfort guidance stays accessible on the movement screen.
- **Charts:** selected metric and 7/14-day range, with real saved values. Empty days remain zero. Each series carries unit and date labels.
- **Motion:** illustration breathing, gentle water waves, completion feedback, route changes and sheet entrances have specific roles. Reduced motion and the persisted animations switch disable these effects. No animation blocks logging.

## Do's and Don'ts

- Do preserve existing logs, goals, routine windows, theme and backups through an update.
- Do keep original artwork in `assets/art/`, with prompts and provenance beside it.
- Do keep functional copy legible and let headings carry the hierarchy.
- Do respect device reduced-motion settings and provide a user-controlled animation preference.
- Don't turn illustrative meals or default goals into personalized medical claims.
- Don't add fake trends, streaks, steps or completion values.
- Don't put affiliate links, development instructions or implementation details into the application.
