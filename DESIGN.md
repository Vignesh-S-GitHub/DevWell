---
name: DevWell Pulse
description: An original wellbeing interface with calm in-place animation.
colors:
  background: "#0b0e17"
  surface: "#121722"
  raised: "#1a2030"
  text: "#f2f4fa"
  muted: "#a1aabd"
  border: "#2a3244"
  accent: "#9cafff"
  electric: "#6e87ff"
  action: "#d7f976"
  action-text: "#141a09"
  light-background: "#f3f5fc"
  light-surface: "#ffffff"
  light-text: "#171e34"
  light-accent: "#3853d3"
typography:
  display:
    fontFamily: "Space, system-ui, sans-serif"
    fontSize: "clamp(60px, 6.9vw, 88px)"
    fontWeight: 500
    lineHeight: 1.02
  body:
    fontFamily: "Space, system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
rounded:
  control: "9px"
  panel: "16px"
  dialog: "20px"
spacing:
  small: "8px"
  group: "16px"
  panel: "26px"
  desktop: "48px"
---

# DevWell Pulse

## Overview

The user explicitly rejected retaining the previous theme or building on top of its visual UI. Pulse replaces that presentation with a new identity: midnight, electric blue and acid lime; a new pulse symbol; Space Grotesk typography; a generated pearlescent loop; and a fixed routine-progress composition. The previous sage, pastel, leaf and clay design is retired.

Saved wellness data and working actions remain the product foundation. Presentation, layout, navigation, dialogs, forms and charts belong to the new Pulse system.

## Colors

All health categories share the same surface and accent system. Food and recovery do not become unrelated colored themes. Dark mode uses midnight surfaces and lime actions. Light mode translates the same system into cool white surfaces and cobalt actions. Inputs, selects, option menus, dialogs, timer screens and installation metadata follow the chosen appearance.

## Typography

Space Grotesk is self-hosted under the SIL Open Font License. Large homepage type is structural, with generous negative space. Other pages use restrained headings and tabular data. Functional labels have an 11px minimum.

## Layout

Desktop uses a full-width header, horizontal navigation and a two-part homepage composition. Mobile uses a compact header and bottom navigation. The home stage surrounds a fixed sculpture with four real-data controls. A command strip offers immediate logs, followed by routine and mood surfaces.

Routine uses a completion overview alongside its timeline. Food uses hydration and a diary. Movement uses a goal meter and four resets. Insights uses actual historical values and recovery entries. Every surface uses the same components.

## Elevation & Depth

Fine outlines and layered midnight surfaces establish depth. Floating controls use restrained neutral shadows. The original sculpture supplies physical dimensionality. A thin progress arc frames the sculpture and shows actual routine completion.

## Shapes

Controls use 9px corners, surfaces 16px, and dialogs 20px. The pulse symbol replaces the leaf. Rings appear only in the actual routine sculpture and timer progress, or the abstract movement/reset illustrations.

## Components

- The primary action is lime in dark mode and cobalt in light mode.
- Navigation uses the same icon weight and selected indicator throughout.
- Forms use matching surfaces, text, focus and borders. Meal type uses four themed radio cards, avoiding the platform select popup. Dates and times retain accessible native inputs.
- Dialogs use the pulse symbol, close control, typography and action hierarchy on every task.
- The homepage sculpture and data controls stay fixed. Shared in-place animations use Web Animations and CSS, with visibility observers and route disposal. There is no pointer parallax or continuous JavaScript rendering loop.
- The timer has a real countdown and completion arc. Breathing cues follow a gentle 4/6 cycle; users can breathe comfortably at their own pace.

## Do's and Don'ts

- Do preserve local logs, goals and backups through upgrades.
- Do use one coherent visual system for every option.
- Do keep progress values based on real saved entries.
- Do respect animation preferences and device reduced motion.
- Don't reintroduce the retired sage/pastel/clay theme or leaf identity.
- Don't use the decorative animation as medical or measured health data.


## Shared identity and animation

The pulse-in-orbit logo combines two orbital arcs and a continuous health rhythm. The 38 original Orbit icons use 24px viewBoxes, rounded 1.75px strokes and currentColor. Meal, exercise, mood, navigation, utility and installation icons share this geometry. The SVG master generates 192px and 512px installation PNGs in CI. Standalone SVGs, a sprite and a preview gallery ship in assets/icons.

Use short, in-place feedback (180–420ms), with no page/card travel, hover lift, spinning markers or drifting artwork. Chart columns grow from their baseline; hydration changes interpolate from the preceding value; routine checks draw and new meal entries fade in place. Routine, Food, Move and Insights have original fixed SVG instruments: draw the linework once and softly change accent opacity over six seconds. These decorative illustrations are aria-hidden and never represent measured data. Loops pause offscreen and in hidden tabs. Animations remain progressive enhancements. The persistent Gentle animations preference retains the existing settings.motion schema; user and device reduced-motion preferences stop nonessential CSS and scripted animation.


## Mobile haptics

Meaningful feedback only: a 12ms tap for timer start/pause, 18ms for logged activities, an 18/45/25ms double pulse for routine completion, and a 45/60/75ms completion signal for a just-finished reset. Numbers alternate vibration and silence. Navigation, scrolling, removing entries and repeated timer ticks are quiet. Rapid feedback is throttled; completion can override a smaller tap. Unsupported hardware and denied vibration never block actions. The persistent preference and test action use the same themed controls. Hidden documents and past timer completions do not trigger delayed haptics. Reduced visual motion remains a separate preference.


## Guided ring resets

All Move cards use fixed circular previews; only a running card’s marker softly changes opacity. A running card shows real elapsed progress. Every timer uses a shared progress arc. Non-breathing inner rings stay fixed and change light intensity. Breathing expansion follows four seconds in and six seconds out, computed from the target timestamp rather than a separate CSS loop. Two short taps announce inhale; one pulse announces exhale. The same timing state drives visual cues and haptics, survives pause/resume, and deduplicates cue notifications. Hidden-page and disabled-vibration periods suppress cues without replaying missed phases on return. Reduced motion freezes decorative scaling but keeps text and progress readable.


## Notifications

A header bell gives direct access without crowding small phone widths; the small edition label yields space below 420px. Notifications use the same Pulse dialog, switches, focus states, icons and buttons. Permission status, a test action and persistent result distinguish opt-in, denial and delivery errors. Weekday routine and break-completion alerts have separate toggles. Upcoming windows use the existing edited schedule and device timezone. A visible scope note explains the running-app requirement and calendar option for closed-app reminders. Native phone notification styling, sound and vibration remain controlled by the operating system.


## Automatic history cleanup

The user selected an automatic 365-day rolling window. Keep today plus the preceding 364 local calendar days, using date-key arithmetic rather than a fixed number of milliseconds. Cleanup is automatic; no repeated confirmation or forced download is required. Preferences presents the policy, retained-from date, last runtime check and an export action. Restore preview explains that expired days are excluded. Active timer state and preferences remain independent of daily history. Browser closure pauses execution, so overdue cleanup runs on the next opening or return.
