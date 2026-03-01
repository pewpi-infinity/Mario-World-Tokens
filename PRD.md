# Planning Guide

A playful photo manipulation app that transforms the iconic pixelated Mario image with creative effects, filters, and retro gaming aesthetics.

**Experience Qualities**: 
1. **Nostalgic** - Evokes memories of classic 8-bit gaming through pixel-perfect aesthetics and retro sound effects
2. **Playful** - Encourages experimentation with whimsical effects and instant visual feedback 
3. **Creative** - Empowers users to transform the image in surprising and delightful ways

**Complexity Level**: Light Application (multiple features with basic state)
- This is a focused creative tool with multiple transformation options, filter controls, and save/export capabilities. It goes beyond single-purpose but doesn't require complex multi-view navigation or advanced state management.

## Essential Features

### Photo Display & Preview
- **Functionality**: Displays the uploaded Mario image prominently with real-time effect previews
- **Purpose**: Serves as the canvas for all creative transformations
- **Trigger**: Loads automatically on app initialization
- **Progression**: App loads → Image displays in center → Effects apply in real-time → Preview updates instantly
- **Success criteria**: Image renders clearly, effects apply smoothly without lag, transformations are immediately visible

### Retro Filters
- **Functionality**: Apply vintage gaming-inspired filters (CRT scan lines, VHS glitch, color palettes from classic consoles)
- **Purpose**: Enhances the nostalgic 8-bit aesthetic with period-appropriate visual treatments
- **Trigger**: User selects filter from preset gallery
- **Progression**: User browses filter thumbnails → Clicks filter → Preview updates → Can toggle intensity → Apply or reset
- **Success criteria**: At least 6 distinct filters, smooth transitions, ability to adjust intensity, clear before/after comparison

### Pixel Art Tools
- **Functionality**: Pixelation controls, color reduction, dithering effects, edge detection for pixel art enhancement
- **Purpose**: Celebrates and enhances the pixel art nature of the source image
- **Trigger**: User adjusts sliders in pixel tools panel
- **Progression**: User opens pixel panel → Adjusts pixelation level → Modifies color depth → Applies dithering → Sees real-time preview
- **Success criteria**: Smooth slider controls, values from subtle to extreme, maintains image recognizability

### Color Transformations
- **Functionality**: Hue shifting, saturation boost/reduction, palette swaps (fire Mario, Luigi, etc.)
- **Purpose**: Allows creative recoloring and character variations
- **Trigger**: User selects color tool or preset palette
- **Progression**: User opens color panel → Adjusts hue/saturation sliders OR selects preset → Preview updates → Save preferred look
- **Success criteria**: Accurate color transformations, preset palettes for classic Mario variations, RGB/HSL controls

### Stickers & Overlays
- **Functionality**: Add retro gaming elements (coins, stars, power-ups, text overlays, pixel borders)
- **Purpose**: Enables creative composition and personalization
- **Trigger**: User clicks sticker button
- **Progression**: User opens sticker panel → Browses categories → Clicks to add → Drag to position → Scale/rotate → Delete if needed
- **Success criteria**: Minimum 12 stickers, drag-and-drop positioning, resize handles, layering controls

### Save & Export
- **Functionality**: Download edited image as PNG, copy to clipboard, save editing state
- **Purpose**: Allows users to keep and share their creations
- **Trigger**: User clicks save/download button
- **Progression**: User finalizes edits → Clicks export → Chooses format → Image downloads OR copies to clipboard → Success confirmation
- **Success criteria**: High-quality export, preserves pixel crispness, filename includes timestamp

## Edge Case Handling

- **No image loaded**: Display placeholder with prompt to upload (though initial version has hardcoded image)
- **Extreme filter combinations**: Gracefully handle performance issues, disable conflicting effects with helpful tooltip
- **Mobile viewport**: Collapse tool panels into drawer, make touch-friendly controls for sticker manipulation
- **Large sticker count**: Limit to 20 active stickers with visual indicator when approaching limit
- **Export failures**: Show error toast with retry option, fallback to canvas right-click save

## Design Direction

The design should feel like stepping into a retro arcade - vibrant neon colors against dark backgrounds, chunky pixel fonts, and UI elements that echo classic game cartridges and CRT monitors. Every interaction should spark joy through micro-animations, satisfying clicks, and immediate visual feedback.

## Color Selection

A bold, saturated color scheme inspired by arcade cabinets and 80s/90s gaming culture.

- **Primary Color**: `oklch(0.58 0.24 330)` - Hot Pink/Magenta - The energetic accent color of arcade neon signs, used for primary CTAs and active states
- **Secondary Colors**: 
  - `oklch(0.65 0.25 265)` - Electric Purple - Supporting UI elements and secondary buttons
  - `oklch(0.70 0.24 190)` - Cyan Blue - Informational elements and hover states
- **Accent Color**: `oklch(0.80 0.20 85)` - Neon Yellow - Attention-grabbing highlights for tool selections and active filters
- **Foreground/Background Pairings**:
  - Background (Deep Space) `oklch(0.15 0.02 280)`: White text `oklch(0.98 0 0)` - Ratio 12.5:1 ✓
  - Card (Elevated Dark) `oklch(0.22 0.03 285)`: Light Gray `oklch(0.92 0.01 280)` - Ratio 10.8:1 ✓
  - Primary (Hot Pink) `oklch(0.58 0.24 330)`: White `oklch(0.98 0 0)` - Ratio 5.2:1 ✓
  - Accent (Neon Yellow) `oklch(0.80 0.20 85)`: Black `oklch(0.15 0.02 280)` - Ratio 9.1:1 ✓

## Font Selection

Typefaces should bridge retro gaming aesthetics with modern readability - chunky and bold for headings, clean and technical for controls.

- **Typographic Hierarchy**: 
  - H1 (App Title): Press Start 2P Bold / 32px / wide letter spacing (0.1em) - Authentic pixel game font for main branding
  - H2 (Section Headers): Space Grotesk Bold / 24px / tight tracking (-0.02em) - Modern geometric font with retro tech feel
  - Body (Controls/Labels): JetBrains Mono Medium / 14px / normal spacing - Monospace for that console/debug aesthetic
  - Buttons: Space Grotesk SemiBold / 16px / uppercase / letter-spacing 0.05em - Clear, confident action labels

## Animations

Animations should feel snappy and game-like - no slow, organic easing. Think instant reactions, pop-in effects, and satisfying micro-interactions that reward every click.

- Sticker placement: Scale-up pop (0 → 1.1 → 1) with slight rotation wobble in 200ms
- Filter application: Quick flash overlay (100ms) followed by cross-fade transition
- Button interactions: Immediate scale down on press (0.95), bounce back with slight overshoot
- Tool panel transitions: Slide-in from edge with elastic easing, 300ms
- Success states: Celebratory particle burst effect for save/export actions

## Component Selection

- **Components**:
  - Dialog for export options with format selection and quality settings
  - Slider for all intensity/value controls (pixelation, color shifts, filter strength)
  - Tabs for organizing tool categories (Filters, Colors, Pixels, Stickers)
  - Card for displaying the main image canvas with border/shadow for depth
  - Button variants for primary (save), secondary (reset), and ghost (tool toggles)
  - Badge for active filter indicators and sticker count
  - Tooltip for explaining advanced controls on hover
  - ScrollArea for sticker/filter galleries when content exceeds viewport
  - Separator between tool sections for visual organization

- **Customizations**:
  - Custom Canvas component with touch/drag handlers for sticker manipulation
  - Pixel-perfect grid overlay toggle for alignment assistance
  - Custom color picker with gaming palette presets
  - Filter thumbnail previews showing actual effect on mini Mario

- **States**:
  - Buttons: Default has neon glow border, hover intensifies glow, active scales down with satisfying click
  - Sliders: Track glows with accent color, thumb is oversized circle with inner shadow
  - Tool panels: Active tool highlighted with accent border-left, inactive are muted
  - Stickers: Selected has dashed outline with corner handles, unselected is transparent overlay on hover

- **Icon Selection**:
  - Sparkles for filters/effects
  - Palette for color tools
  - GridFour for pixelation
  - Sticker for overlay panel
  - FloppyDisk for save (retro!)
  - Download for export
  - ArrowCounterClockwise for reset
  - Play for preview toggle

- **Spacing**:
  - Tool panels: p-6 with gap-4 between control groups
  - Button groups: gap-3 for related actions
  - Main canvas: mx-auto with max-w-4xl, my-8
  - Section headers: mb-4
  - Inline controls: gap-2 for label + input pairs

- **Mobile**:
  - Tool panels collapse into bottom sheet drawer (pulled up from bottom)
  - Canvas takes full width with touch-zoom enabled
  - Sticker controls switch to single-finger drag, two-finger pinch-rotate-scale
  - Filter gallery becomes horizontal scroll strip
  - Export menu simplified to essential options only
