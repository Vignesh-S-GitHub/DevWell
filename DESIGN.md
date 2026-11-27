---
name: DevWell
description: Everyday health for screen-heavy workdays.
colors:
  bg: "#f5f6ef"
  surface: "#fff"
  ink: "#152b25"
  muted: "#5c6c62"
  line: "#e0e6db"
  green: "#245a46"
  lime: "#dcf5a9"
  blue: "#dfedfa"
  peach: "#fce6d4"
  lav: "#eee7fa"
  hero: "#204e3c"
  hero-ink: "#f8fff0"
  hero-muted: "#d6e6d5"
  metric-ink: "#173129"
  metric-muted: "#40584e"
  progress: "#3b7659"
  selected: "#dff0d4"
  pill: "#e9f2dd"
  icon-sage: "#e8f2dd"
  focus: "#769d40"
  danger: "#a43126"
  dark-bg: "#14221d"
  dark-surface: "#20342b"
  dark-ink: "#f1f6e9"
  dark-muted: "#b5c4b9"
  dark-line: "#354a40"
  dark-green: "#a8e1b5"
typography:
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "33px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-.04em"
  hero-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-.025em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "-.025em"
  subtitle:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "-.025em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  support:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "normal"
  metric:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-.03em"
  timer:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "52px"
    fontWeight: 800
    lineHeight: 1.45
    letterSpacing: "-.04em"
rounded:
  field: "12px"
  secondary: "13px"
  primary: "14px"
  pill: "20px"
  metric: "21px"
  panel: "23px"
  dialog: "24px"
  hero: "27px"
  circle: "50%"
spacing:
  step-4: "4px"
  step-6: "6px"
  step-8: "8px"
  step-10: "10px"
  step-11: "11px"
  step-12: "12px"
  step-14: "14px"
  step-15: "15px"
  step-16: "16px"
  step-17: "17px"
  step-20: "20px"
  step-21: "21px"
  step-22: "22px"
  step-28: "28px"
  step-38: "38px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.primary}"
    padding: "12px 16px"
    width: "100%"
  button-secondary:
    textColor: "{colors.ink}"
    rounded: "{rounded.secondary}"
    padding: "10px 15px"
  button-link:
    textColor: "{colors.green}"
    padding: "0 4px"
  field:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px"
    width: "100%"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "17px"
  pill:
    backgroundColor: "{colors.pill}"
    textColor: "{colors.green}"
    rounded: "{rounded.pill}"
    padding: "5px 10px"
  nav-active:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.green}"
    rounded: "{rounded.field}"
  completion-done:
    backgroundColor: "{colors.green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.circle}"
    size: "46px"
  hero:
    backgroundColor: "{colors.hero}"
    textColor: "{colors.hero-ink}"
    rounded: "{rounded.hero}"
    padding: "20px"
  metric-water:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.metric-ink}"
    rounded: "{rounded.metric}"
    padding: "15px"
  metric-food:
    backgroundColor: "{colors.peach}"
    textColor: "{colors.metric-ink}"
    rounded: "{rounded.metric}"
    padding: "15px"
  metric-move:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.metric-ink}"
    rounded: "{rounded.metric}"
    padding: "15px"
  metric-sleep:
    backgroundColor: "{colors.lav}"
    textColor: "{colors.metric-ink}"
    rounded: "{rounded.metric}"
    padding: "15px"
---
# Design System: DevWell

## Overview

**Creative North Star: "Everyday health"**

DevWell extends the supplied mobile prototype into a practical personal wellness companion. Its forest and sage identity, pastel health categories, authored leaf mark and five-tab navigation are the visual authority. “Everyday health” is the incumbent app title, used here as a descriptive anchor rather than a newly selected metaphor.

Compact rounded containers, clear numerical progress and familiar system typography make everyday logging approachable. Desktop adds useful space while keeping the mobile language. This records the implemented system, not a separately approved visual redesign or newly inferred user preferences.

**Key Characteristics:**
- Forest identity and pastel health categories.
- Mobile-first navigation with an expanded desktop container.
- Legible system type, keyboard focus and restrained motion.
- Flat panels with limited floating elevation.

## Colors

Forest provides identity and action emphasis; sage and soft category colors make progress easy to scan. Frontmatter is normative and retains the existing CSS token names where available.

### Primary

- **Forest (`green`)** supports theme-aware link and active text. Primary buttons, completed checks and the logo tile use fixed forest, even in dark mode.
- **Hero forest (`hero`)** anchors daily completion, with its own pale text and muted copy.
- **Progress green (`progress`)** fills horizontal tracks.

### Secondary

- **Movement lime (`lime`)**, **hydration blue (`blue`)**, **nutrition peach (`peach`)** and **sleep lavender (`lav`)** distinguish the four health categories. Pastel cards retain fixed dark metric text in both themes.
- **Selected sage (`selected`)** marks active navigation and mood choices; **pill sage (`pill`)** and **icon sage (`icon-sage`)** support compact context and routine symbols.

### Neutral

- **Warm page (`bg`)**, **white surface (`surface`)**, **deep ink (`ink`)**, **muted sage (`muted`)** and **soft line (`line`)** provide the shell, text hierarchy and separators.
- The six `dark-*` tokens replace corresponding page, surface, text, border and action roles under the dark body state.
- **Focus moss (`focus`)** supplies the keyboard outline. **Danger red (`danger`)** marks destructive actions and form errors; dark danger text uses light coral (`#ffb4a8`).

## Typography

All roles use the system stack in frontmatter. There are no downloaded typefaces. Headings have tight tracking; body text keeps an ordinary reading rhythm, with larger values carrying visual emphasis.

- **Headline:** page titles; grows to (40px), with a (600px) maximum width, at desktop.
- **Hero title:** daily summary; grows to (30px) on desktop. Supporting hero copy grows from (12px) to (14px).
- **Title / subtitle:** section and panel headings. Dialog titles use (22px) and a (1.2) line height.
- **Body / support / label:** ordinary copy, secondary copy and bold field labels.
- **Metric:** snapshot values; shrinks to (23px) on narrow screens. Large totals use (40px), weight (800). Timers use tabular numbers.
- **Brand:** (22px), weight (800), tracking (-.03em), growing to (25px) on desktop. Navigation labels use (11px) on mobile and (13px) on desktop; active labels use weight (800).

## Layout

The centered mobile shell caps at (460px) and has a (100dvh) minimum height. Main content uses (20px) horizontal padding and bottom clearance for fixed navigation. Snapshot cards form two equal columns with an (11px) gap. Spacing steps are extracted from current code, not a newly imposed scale.

At (600px), the narrow shell gains inline borders. At (800px), the shell expands to (920px), adds (38px) horizontal shell padding and drops the borders. Metrics become four columns; panel padding grows from (17px) to (21px). The desktop navigation floats (14px) above the viewport bottom, capped at (820px), with icons beside labels.

At widths of (360px) or less, header and main padding drop to (14px), hero padding drops to (16px), and the ring shrinks. Mood choices remain four equal columns. Dialogs cap at (420px) wide and (90dvh) tall with internal scrolling; the routine editor caps at (48dvh). Mobile navigation includes safe-area bottom padding.

## Elevation & Depth

Tonal surfaces, borders and spacing do most grouping. Panels are flat in the final CSS cascade: their original shadow is disabled. The original ornamental hero pseudo-element is also disabled. Elevation is reserved for the floating desktop dock and temporary toast; a translucent backdrop separates dialogs.

- **Desktop dock:** `0 8px 30px #0000000d`.
- **Toast:** `0 5px 20px #0002`.
- **Dialog backdrop:** `#122a2166`.

**The Flat Panel Rule.** Keep content panels flat; use the existing border and tonal surface to separate them.

## Shapes

Rounded rectangles use the role-specific corner tokens in frontmatter. Header circles and completion controls have (46px) targets. The authored leaf sits in a forest tile of (39px) with a (13px) corner. SVGs have a (24 × 24) viewBox, rendered at (22px), with (1.8px) rounded strokes and no fill.

Tracks have pill ends. The hero ring uses (112px) outer and (91px) inner diameters, shrinking to (95px) and (78px) on narrow screens. History bars use softly rounded top corners.

## Components

### Buttons

Primary actions are full-width fixed forest buttons with white text and a (48px) minimum height. Secondary buttons have a thin line border and inherited text, also at least (48px) high. Text actions use theme-aware green, weight (750), and a (44px) minimum target. Utility circles use the theme surface. Destructive filled actions use danger red.

Buttons dim with `brightness(.97)` on hover, compress with `scale(.98)` when pressed, and use a (3px) focus outline with a (3px) offset. Background and text transitions last (.18s). Disabled controls use opacity (.55) and the unavailable cursor.

### Chips

Pills are informational sage labels with forest text and weight (750). Mood choices are secondary buttons; selection adds the selected-sage background and fixed forest text, with `aria-pressed` carrying state.

### Cards / Containers

Panels use the theme surface, thin line border and no shadow. Snapshot metrics are whole-card category actions with a translucent white icon tile, dark text, prominent value and a goal track. They lift (2px) on hover over (.3s) with the established easing.

### Inputs / Fields

Inputs and selects use the theme background and ink, thin line border, field corners and (12px) padding, with a (48px) minimum height. Bold labels sit above with a (6px) gap. Placeholder text uses the muted role at full opacity. Keyboard focus uses the shared outline; the restore-file label exposes it through focus-within. Routine form errors use danger text and a live alert.

### Navigation

Today, Routine, Food, Move and Insights remain five equal destinations, each with inline SVG and text. Active state combines stronger label weight, green text and a sage icon tile, with `aria-current`. Mobile fixes the bar to the viewport bottom; desktop floats the same five destinations in a rounded dock.

### Routine completion

Rows combine sage symbol tiles, time windows, bold activity text, supporting copy and circular completion controls. Completion fills forest, shows a white check, exposes `aria-pressed`, and makes activity text muted and struck through. The check scales in over (.35s); color changes last (.25s), using `cubic-bezier(.16,1,.3,1)`.

### Daily completion hero

The forest summary pairs short copy with a circular percentage and equivalent text. The conic ring has a pale lime completed portion and translucent remainder. The removed Daily routine kicker and decorative pseudo-element rings are absent from the current composition.

The final app disables the prototype page-entry animation. Reduced-motion mode removes all animation and transitions, including pseudo-elements. Toasts are concise status messages; native dialogs are bounded editing surfaces with internal scrolling.

## Do's and Don'ts

### Do:
- **Do** preserve the authored leaf and forest/sage/pastel identity.
- **Do** retain Today, Routine, Food, Move and Insights on every screen width.
- **Do** pair graphical progress and selection with text or semantic state.
- **Do** preserve visible focus, touch targets and reduced-motion support.
- **Do** use the established category colors consistently.

### Don't:
- **Don't** replace the incumbent identity with an unrelated visual world.
- **Don't** restore the disabled decorative hero rings as a default pattern.
- **Don't** reinstate the removed Daily routine hero kicker as a system requirement.
- **Don't** assume all forest and pastel components recolor with the dark theme.
- **Don't** add cloud or account status patterns without new product scope.
