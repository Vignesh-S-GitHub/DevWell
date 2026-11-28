---
name: DevWell Pulse
description: An original kinetic wellbeing interface.
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

The user explicitly rejected retaining the previous theme or building on top of its visual UI. Pulse replaces that presentation with a new identity: midnight, electric blue and acid lime; a new pulse symbol; Space Grotesk typography; a generated pearlescent loop; and a live canvas composition. The previous sage, pastel, leaf and clay design is retired.

Saved wellness data and working actions remain the product foundation. Presentation, layout, navigation, dialogs, forms and charts belong to the new Pulse system.

## Colors

All health categories share the same surface and accent system. Food and recovery do not become unrelated colored themes. Dark mode uses midnight surfaces and lime actions. Light mode translates the same system into cool white surfaces and cobalt actions. Inputs, selects, option menus, dialogs, timer screens and installation metadata follow the chosen appearance.

## Typography

Space Grotesk is self-hosted under the SIL Open Font License. Large homepage type is structural, with generous negative space. Other pages use restrained headings and tabular data. Functional labels have an 11px minimum.

## Layout

Desktop uses a full-width header, horizontal navigation and a two-part homepage composition. Mobile uses a compact header and bottom navigation. The home stage surrounds a kinetic sculpture with four real-data controls. A command strip offers immediate logs, followed by routine and mood surfaces.

Routine uses a completion overview alongside its timeline. Food uses hydration and a diary. Movement uses a goal meter and four resets. Insights uses actual historical values and recovery entries. Every surface uses the same components.

## Elevation & Depth

Fine outlines and layered midnight surfaces establish depth. Floating controls use restrained neutral shadows. The original sculpture supplies physical dimensionality. The canvas contributes live orbital paths and particles.

## Shapes

Controls use 9px corners, surfaces 16px, and dialogs 20px. The pulse symbol replaces the leaf. Rings appear only in the actual routine sculpture and timer progress, or the abstract movement/reset illustrations.

## Components

- The primary action is lime in dark mode and cobalt in light mode.
- Navigation uses the same icon weight and selected indicator throughout.
- Forms use matching surfaces, text, focus and borders. Meal type uses four themed radio cards, avoiding the platform select popup. Dates and times retain accessible native inputs.
- Dialogs use the pulse symbol, close control, typography and action hierarchy on every task.
- The homepage animation uses requestAnimationFrame, pointer parallax and visibility/resize observers. It pauses offscreen, when the document is hidden, and under reduced motion. It is disposed on route changes.
- The timer has a real countdown and completion arc. Breathing cues follow a gentle 4/6 cycle; users can breathe comfortably at their own pace.

## Do's and Don'ts

- Do preserve local logs, goals and backups through upgrades.
- Do use one coherent visual system for every option.
- Do keep progress values based on real saved entries.
- Do respect animation preferences and device reduced motion.
- Don't reintroduce the retired sage/pastel/clay theme or leaf identity.
- Don't use the decorative animation as medical or measured health data.


## Pulse 3.1 identity and motion

The pulse-in-orbit logo combines two orbital arcs and a continuous health rhythm. The 38 original Orbit icons use 24px viewBoxes, rounded 1.75px strokes and currentColor. Meal, exercise, mood, navigation, utility and installation icons share this geometry. The SVG master generates 192px and 512px installation PNGs in CI. Standalone SVGs, a sprite and a preview gallery ship in assets/icons.

Shared motion uses 280–550ms feedback and short staggered section entrances. Chart columns grow from their baseline; hydration changes interpolate from the preceding value; routine completion and new meal entries receive restrained feedback. Slow reset illustrations move only while visible. All loops pause in hidden tabs. Animations remain progressive enhancements: content and controls are available without them. Both user and device reduced-motion preferences stop CSS and scripted motion.


## Mobile haptics

Meaningful feedback only: a 12ms tap for timer start/pause, 18ms for logged activities, an 18/45/25ms double pulse for routine completion, and a 45/60/75ms completion signal for a just-finished reset. Numbers alternate vibration and silence. Navigation, scrolling, removing entries and repeated timer ticks are quiet. Rapid feedback is throttled; completion can override a smaller tap. Unsupported hardware and denied vibration never block actions. The persistent preference and test action use the same themed controls. Hidden documents and past timer completions do not trigger delayed haptics. Reduced visual motion remains a separate preference.
