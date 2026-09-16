---
name: Busan Alley Balancer
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#56423c'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#8a726b'
  outline-variant: '#ddc0b8'
  surface-tint: '#a04022'
  primary: '#9d3e20'
  on-primary: '#ffffff'
  primary-container: '#bd5535'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59f'
  secondary: '#485f84'
  on-secondary: '#ffffff'
  secondary-container: '#bbd3fd'
  on-secondary-container: '#445a7f'
  tertiary: '#815200'
  on-tertiary: '#ffffff'
  tertiary-container: '#a26800'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb59f'
  on-primary-fixed: '#3a0a00'
  on-primary-fixed-variant: '#80290c'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#b0c7f1'
  on-secondary-fixed: '#001b3c'
  on-secondary-fixed-variant: '#30476a'
  tertiary-fixed: '#ffddb6'
  tertiary-fixed-dim: '#ffb95a'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#643f00'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Epilogue
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Epilogue
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Epilogue
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system blends the warm, nostalgic charm of Busan’s sunlit hillside alleyways (Gamcheon, Choryang, Yeongdo) with structured, contemporary financial planning tools. The platform empowers travelers to wander freely through hidden coastal and cultural enclaves without financial friction, providing tactile, reassuring, and delightfully vivid itinerary tracking.

The design movement is **Warm Editorial Contemporary with Tactile Coastal Elements**. It marries crisp, high-utility financial interfaces (clean figures, progress gauges, categorical distributions) with editorial lifestyle warmth—incorporating sun-baked architectural tones, soft atmospheric layering, and subtle stamp/badge accents reminiscent of vintage Korean travel transit passes. The emotional tone is reassuring, adventurous, sun-drenched, and organized.

## Colors

The color palette directly references the layered textures of Busan's coastal steps: sun-warmed clay roof tiles, coastal marine waters, vibrant hillside paint, and salt-bleached mortar.

- **Primary (`#D86A48` - Terracotta Brick):** The soul of hillside stepped houses. Drives key interactive elements, primary action buttons, budget milestone highlights, and active states.
- **Secondary (`#1D3557` - Deep Ocean Cobalt):** Anchors typographical hierarchy, navigation bars, prominent numeric figures, and deep contrast containers. Evokes Busan’s night ports and deep maritime roots.
- **Tertiary (`#F3A83B` - Warm Ochre):** The shade of golden streetlights and alleyway flower pots. Employed for warning alerts, category tagging (e.g., street food, cafe hops), and celebratory progress indicators.
- **Neutral Accent / Coastal Marine (`#457B9D` - Sea Glass Teal):** Serves as an expressive supporting accent for savings cushions, balanced indicators, and transport links.
- **Base Canvas (`#FDFBF7` - Crisp Ivory Cream):** Replaces harsh sterile white with a tactile, paper-like background that softens contrast and improves reading comfort during long travel-planning sessions.
- **Surface Elevation:** Secondary cards sit on `#FFFFFF`, with borders tinted with muted terracotta mist (`rgba(216, 106, 72, 0.12)`) or deep navy mist (`rgba(29, 53, 87, 0.08)`).

## Typography

The pairing combines **Epilogue** for display and section headers with **Plus Jakarta Sans** for interfaces, body copy, and numerical readouts.

- **Epilogue:** Delivers architectural presence, sturdy character, and warm editorial distinction. It mirrors the bold, layered personality of steep hillside street typography and historic port signs.
- **Plus Jakarta Sans:** Provides clean, approachable geometry with open counters, guaranteeing immediate scanning of currency values (KRW, USD, EUR), timetable stops, and breakdown percentages.
- **Data & Numbers:** Currency values, tallies, and percentages use tabular sizing within Plus Jakarta Sans to prevent layout jitter when values re-balance dynamically.

## Layout & Spacing

The layout philosophy implements a responsive fluid grid with high structural balance:
- **Desktop (1024px+):** 12-column grid with `2rem` outer margins and `1.25rem` gutters. Accommodates split views—such as dynamic itinerary mapping alongside persistent budget ledger sliders. Max container width capped at `1280px` for optimal density.
- **Tablet (768px - 1023px):** 8-column grid with `1.5rem` outer margins. Modules transition to stacked cards with sticky summary bars.
- **Mobile (< 768px):** 4-column fluid layout with `1rem` outer canvas margins and `0.75rem` column gaps. Budget balance sheets pin to bottom sheets for one-handed thumb interaction while traveling on foot.

Spacing tokens follow a strict 4px/8px modular cadence to preserve visual rhythm across dense analytical travel widgets and generous editorial cover headers.

## Elevation & Depth

Visual depth combines **sun-cast ambient shadows** with **tonal grounding**, echoing the bright daylight of seaside streets:

- **Surface Levels:**
  - **Ground (`#FDFBF7`):** The primary view canvas.
  - **Level 1 (`#FFFFFF`):** Base content containers, itinerary nodes, and standard input rows. Outlined with `1px solid rgba(29, 53, 87, 0.07)`.
  - **Level 2 (Interactive Floating Cards):** Budget allocation meters, active route stops, and dropdown selectors. Uses an ambient warm drop shadow: `0 8px 24px -4px rgba(216, 106, 72, 0.08), 0 2px 6px -1px rgba(29, 53, 87, 0.05)`.
  - **Level 3 (Modal & Pinned Overlays):** Sticky bottom balance calculator and flight/train itinerary draw cards. Shadow: `0 16px 36px -6px rgba(29, 53, 87, 0.16)`.
- **Micro-tactility:** Interactive items carry soft inner highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.6)`) to evoke enameled steel alley signs.

## Shapes

The design system employs a **Rounded** shape language (`roundedness: 2`, base `0.5rem` / `8px`):
- **Base Components (Buttons, Input Fields, Badges):** `0.5rem` (8px) radius creates an inviting, accessible hand-held aesthetic.
- **Containers & Itinerary Cards (`rounded-lg`):** `1rem` (16px) radius softens complex multi-line budget modules.
- **Persistent Sheets & Sticky Drawers (`rounded-xl`):** `1.5rem` (24px) for upper corners, evoking soft luggage tags and curved transport tokens.
- **Pills / Badges:** Full circular rounding (`9999px`) reserved strictly for status chips (e.g., "Under Budget", "Street Food", "Confirmed").

## Components

- **Buttons:**
  - *Primary:* Terracotta background (`#D86A48`), white text (`#FFFFFF`), subtle bottom bevel (`box-shadow: 0 2px 0 #B24F30`), `0.5rem` border radius. Active state depresses slightly (`translateY(1px)`).
  - *Secondary:* Deep ocean cobalt border (`1.5px solid #1D3557`), text `#1D3557`, surface transparent, hover fills with `rgba(29, 53, 87, 0.06)`.
  - *Tertiary / Ghost:* Ochre or terracotta tinted text with transparent background for low-friction actions (e.g., "Add split traveler").

- **Interactive Budget Sliders & Progress Trackers:**
  - Dual-tone range rails (`#E2DDD5` unfilled, `#D86A48` active fill) with a chunky circular handle (`24px`, `#1D3557`, centered `#FFFFFF` dot).
  - Visual breakdown indicators split into dynamic segments: Food (Ochre `#F3A83B`), Transit (Cobalt `#1D3557`), Lodging (Terracotta `#D86A48`), Experience (Teal `#457B9D`).

- **Alleyway Experience & Expense Cards:**
  - White surface with crisp `1px` stroke in `rgba(29, 53, 87, 0.08)`.
  - Left edge adorned with a vertical color-coded category pip (4px width).
  - Right-aligned tabular typography for remaining allowance and split sums.

- **Chips & Tags:**
  - Height `28px`, pill-shaped (`9999px`), bold micro-typography (`label-sm`).
  - Warm Ochre chip: `background: #FEF6EA; color: #9B5C08; border: 1px solid #F8CE88`.
  - Sea Glass Teal chip: `background: #EEF5F8; color: #2B5770; border: 1px solid #B8D5E5`.

- **Input Fields & Currency Selectors:**
  - Background `#FFFFFF`, border `1.5px solid rgba(29, 53, 87, 0.16)`.
  - Prefix fixed slot for currency glyphs (₩, $, €) rendered in bold `#1D3557`. Focus ring glows with `0 0 0 3px rgba(216, 106, 72, 0.20)` and switches border to `#D86A48`.

- **Selection Controls (Checkboxes & Radios):**
  - Checkboxes use `0.375rem` radius; selected fill is `#1D3557` with white checkmark.
  - Radios display concentric terracotta circles on selection.

- **Nostalgic Travel Stamp & Alley Balance Metric:**
  - Circular or ticket-notched badge modules displaying "Budget Health Score" or "Daily Alleyway Allowance", featuring dotted border trims (`2px dashed rgba(29, 53, 87, 0.25)`) and editorial rotated date stamps.