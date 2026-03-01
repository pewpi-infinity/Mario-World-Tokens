# Planning Guide

A decentralized token creation and treasury management system where users mint Mario-branded coins (equivalent to USD) and attach creative content - music, videos, images, poetry, or clout connections to famous people. The Federal Reserve Mario system empowers anyone to become their own mint.

**Experience Qualities**: 
1. **Empowering** - Users become their own central bank, printing currency and backing it with creative content
2. **Playful** - Mario logo brings fun to financial concepts, charts show Mario running through treasury data
3. **Transparent** - Full visibility into treasury creation, coin minting, and attached content values

**Complexity Level**: Complex Application (advanced functionality with multiple views)
- This is a sophisticated platform combining treasury management, token minting, content attachment, charting with animated Mario character, and a global ledger system. Requires persistent state, dynamic data visualization, and multiple interconnected features.

## Essential Features

### Mario Logo Display
- **Functionality**: Shows Mario as the official logo/mascot of the Federal Reserve Mario system
- **Purpose**: Brand identity and visual anchor for the currency system
- **Trigger**: Displays prominently in header and appears as animated character in charts
- **Progression**: App loads → Mario logo appears → Logo animates in charts → Moves with data trends
- **Success criteria**: Clean Mario logo extraction from image, smooth animations, visible in all key areas

### Token Minting Interface
- **Functionality**: Create new Mario Coins with USD-equivalent value and attach content (music, video, images, poetry, clout/fame connections)
- **Purpose**: Democratizes currency creation - anyone can print their own treasury
- **Trigger**: User clicks "Mint New Coin" button
- **Progression**: User clicks mint → Enters coin value (USD) → Selects content type → Uploads/attaches content → Describes attachment → Confirms minting → Coin added to treasury
- **Success criteria**: Intuitive form, supports multiple content types, instant visual feedback, coin appears in user's treasury

### Personal Treasury Dashboard
- **Functionality**: View all coins user has minted with total value, content attachments, and individual coin details
- **Purpose**: Track personal currency creation and content-backed wealth
- **Trigger**: Automatically displays user's minted coins
- **Progression**: User views dashboard → Sees total treasury value → Browses coin cards → Clicks for details → Can transfer/gift coins
- **Success criteria**: Real-time value calculation, searchable/filterable coin list, visual content previews

### Treasury Charts with Mario Character
- **Functionality**: Animated charts showing treasury growth over time with Mario character running/moving through the data
- **Purpose**: Gamifies financial data visualization and makes economics playful
- **Trigger**: Charts update as coins are minted
- **Progression**: User mints coins → Chart updates → Mario character moves to new data point → Animations show growth
- **Success criteria**: Smooth Mario animations, accurate data representation, responsive to new minting activity

### Global Ledger
- **Functionality**: Public view of all Mario Coins minted by all users (anonymous but transparent)
- **Purpose**: Creates transparency in the decentralized currency system
- **Trigger**: User navigates to "Global Ledger" tab
- **Progression**: User clicks ledger → Sees all coins → Can filter by content type → View coin details → See minting trends
- **Success criteria**: Fast loading, filterable by content type/value, real-time updates when new coins minted

### Content Attachment System
- **Functionality**: Attach and view music notes, video clips, images, poetry, or fame/clout connections to coins
- **Purpose**: Backs currency with creative and social value
- **Trigger**: During minting or when viewing coin details
- **Progression**: User selects content type → Uploads or describes content → Content displays with coin → Others can view attached content
- **Success criteria**: Supports 5+ content types, rich previews, descriptions stored with coins

### Transfer & Receipt System
- **Functionality**: Transfer coins to others and generate printable receipts
- **Purpose**: Enables currency circulation and creates transaction records
- **Trigger**: User clicks "Transfer" on a coin
- **Progression**: User selects coin → Enters recipient info → Adds transfer note → Confirms → Receipt generated → Can print/download
- **Success criteria**: Clear transfer flow, beautiful receipt design, tracks coin ownership changes

## Edge Case Handling

- **Empty Treasury**: Display welcoming empty state encouraging first coin minting with tutorial
- **Duplicate Minting**: Prevent accidental double-mints with confirmation dialog
- **Large Content Files**: Show upload progress, validate file sizes, provide compression options
- **Chart Performance**: Limit visible data points, implement virtualization for large datasets
- **Transfer Failures**: Graceful error handling with retry option, preserve coin ownership
- **Mobile Minting**: Simplified form with mobile-friendly file upload, touch-optimized controls

## Design Direction

The design should evoke the trustworthiness of a financial institution merged with the playful energy of Mario games. Think Federal Reserve meets Mushroom Kingdom - professional charts and data displays made delightful with Mario branding, coin imagery, and gaming aesthetics. Every interaction should feel empowering, like you're literally printing money.

## Color Selection

A vibrant gaming palette that maintains financial credibility through strategic use of gold, green (money), and trustworthy blues.

- **Primary Color**: `oklch(0.75 0.18 85)` - Gold Coin - Represents currency, value, and Mario's iconic coins, used for minting buttons and value displays
- **Secondary Colors**: 
  - `oklch(0.65 0.15 155)` - Money Green - USD connection, treasury growth indicators, positive value changes
  - `oklch(0.58 0.24 330)` - Mario Red - Brand color from Mario, danger/destructive actions, important alerts
- **Accent Color**: `oklch(0.70 0.24 190)` - Power-Up Blue - Interactive elements, chart highlights, Mario character accents
- **Foreground/Background Pairings**:
  - Background (Deep Navy) `oklch(0.15 0.02 280)`: White text `oklch(0.98 0 0)` - Ratio 12.5:1 ✓
  - Card (Elevated Dark) `oklch(0.22 0.03 285)`: Light Gray `oklch(0.92 0.01 280)` - Ratio 10.8:1 ✓
  - Primary (Gold Coin) `oklch(0.75 0.18 85)`: Dark Navy `oklch(0.15 0.02 280)` - Ratio 8.3:1 ✓
  - Secondary (Money Green) `oklch(0.65 0.15 155)`: White `oklch(0.98 0 0)` - Ratio 4.9:1 ✓

## Font Selection

Professional yet playful typefaces that balance financial seriousness with gaming fun.

- **Typographic Hierarchy**: 
  - H1 (App Title): Press Start 2P Bold / 36px / wide letter spacing (0.08em) - Authentic pixel game font for "Federal Reserve Mario"
  - H2 (Section Headers): Space Grotesk Bold / 28px / tight tracking (-0.01em) - Modern, trustworthy headlines
  - H3 (Card Titles): Space Grotesk SemiBold / 20px / normal spacing - Clear subsection hierarchy
  - Body (Descriptions): JetBrains Mono Regular / 14px / line-height 1.6 - Readable, technical feel for data
  - Numbers (Values/Amounts): JetBrains Mono SemiBold / 16-24px / tabular-nums - Clear financial figures
  - Buttons: Space Grotesk Bold / 16px / uppercase / letter-spacing 0.06em - Confident action labels

## Animations

Animations should celebrate achievement and provide clear feedback - think coin collection sounds visualized, satisfying mint confirmations, and playful Mario movements through charts.

- Coin Minting: Scale-up appearance (0 → 1.2 → 1) with golden shimmer effect, 400ms with bounce easing
- Mario Chart Movement: Smooth position transitions following data curve, subtle jump animation at peaks, 800ms
- Treasury Value Updates: Number counter animation rolling up to new total, 600ms
- Transfer Success: Coin slides from treasury to recipient with trail effect, 500ms
- Button Interactions: Haptic-style scale down (0.95) on press, immediate spring back
- Chart Updates: New data points fade in with expanding circle ripple, 300ms

## Component Selection

- **Components**:
  - Dialog for minting interface with multi-step form (value → content → confirm)
  - Card for individual coin displays with content preview
  - Tabs for main navigation (My Treasury, Charts, Global Ledger, Mint)
  - Badge for coin value, content type labels, status indicators
  - Button variants for primary (mint), secondary (transfer), ghost (view details)
  - Table for global ledger with sortable columns
  - ScrollArea for long coin lists and ledger
  - Separator for visual organization between treasury sections
  - Progress for upload/minting progress feedback
  - Tooltip for explaining treasury terms and features

- **Customizations**:
  - Custom chart component with D3 showing Mario character as data point
  - Coin card component with metallic gold shimmer effect
  - Receipt component with printable stylesheet
  - Content attachment preview cards for each media type
  - Treasury balance display with animated counter

- **States**:
  - Mint Button: Default gold glow, hover intensifies with pulsing effect, active scales with satisfying click
  - Coin Cards: Default subtle shadow, hover elevates with stronger shadow, selected has gold border
  - Chart Mario: Idle state has slight bobbing animation, active state jumps when values increase
  - Transfer Button: Default secondary style, hover shows recipient preview, disabled is greyed with tooltip

- **Icon Selection**:
  - Coins/CurrencyDollar for minting and treasury
  - TrendUp/TrendDown for value changes
  - MusicNotes, Image, VideoCamera, Pen, Users for content types
  - ArrowsLeftRight for transfers
  - Receipt for transaction records
  - Globe for global ledger
  - ChartLine for analytics

- **Spacing**:
  - Main dashboard: Container with max-w-7xl, px-4, py-8
  - Coin grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 with gap-6
  - Minting form: space-y-6 for form sections
  - Treasury stats: flex with gap-4 for value cards
  - Chart container: p-6 with aspect-video for responsive sizing

- **Mobile**:
  - Tabs become bottom navigation bar
  - Coin cards stack vertically at full width
  - Minting form becomes single-column with larger touch targets
  - Charts maintain aspect ratio, Mario character scales appropriately
  - Global ledger switches to card view instead of table
  - Swipe gestures for navigating between coins
