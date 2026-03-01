# Planning Guide

A decentralized digital currency platform that enables authorized minters to produce serial-numbered Mario Tokens (Federal Reserve Notes) with fixed denominations ($1, $5, $10, $20, $50, $100), while providing transparent wallet management and transaction tracking through GitHub integration.

**Experience Qualities**:
1. **Trustworthy** - Every token is uniquely serial-numbered and all transactions are permanently recorded, creating an immutable audit trail that builds confidence
2. **Accessible** - Any GitHub user can receive and manage tokens without premium subscriptions, making financial participation barrier-free
3. **Official** - The minting process mirrors Federal Reserve operations with professional styling, serial numbers, and production metadata that gives each token authentic gravitas

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This requires multi-role authentication (minters vs. users), token generation with unique serial numbers, wallet management, transaction history, GitHub user integration, and transparent ledger tracking across the entire economy.

## Essential Features

### Token Minting (Minter Role Only)
- **Functionality**: Authorized minters can create new tokens in standard denominations with unique serial numbers, location stamps, and design notes
- **Purpose**: Establishes controlled token production similar to Federal Reserve operations, preventing counterfeiting while allowing economic expansion
- **Trigger**: Minter clicks "Mint New Token" button
- **Progression**: Select denomination → Auto-generate serial number → Enter location/design notes → Review token preview → Confirm minting → Token created and added to minter's distribution pool
- **Success criteria**: Token appears in system with unique serial number, all metadata recorded, ready for distribution

### Token Distribution
- **Functionality**: Minters can transfer tokens from their pool to any GitHub user's wallet
- **Purpose**: Circulates currency into the economy by getting tokens to end users
- **Trigger**: Minter enters recipient's GitHub username and selects tokens to send
- **Progression**: Enter recipient username → Select tokens from available pool → Review transfer → Confirm → Tokens move to recipient's wallet → Transaction recorded
- **Success criteria**: Recipient sees tokens in their wallet, transaction appears in both parties' history and global ledger

### Personal Wallet
- **Functionality**: Users view their token balance, individual token details (serial numbers, denomination, minting history), and can transfer tokens to other users
- **Purpose**: Provides ownership management and transaction capabilities for all participants
- **Trigger**: User logs in with GitHub authentication
- **Progression**: GitHub login → View wallet balance → Explore individual tokens → Initiate transfer → Enter recipient → Select tokens → Confirm → Transaction complete
- **Success criteria**: Balance updates in real-time, all tokens traceable to origin, transfers execute successfully

### Global Transaction Ledger
- **Functionality**: Public view of all minted tokens, their current owners, and complete transaction history
- **Purpose**: Creates transparency and prevents fraud by making all economic activity visible
- **Trigger**: User navigates to "Ledger" tab
- **Progression**: View all tokens → Filter by serial number, denomination, or owner → Trace token's complete journey from minting to current holder
- **Success criteria**: Every token and transaction visible, searchable, and traceable to source

### Token Authentication & Rarity
- **Functionality**: Each token displays its unique serial number, minting location, design notes, and creation timestamp
- **Purpose**: Enables collector value for rare serial numbers (repeating digits, sequential patterns, historic dates) while preventing duplication
- **Trigger**: User clicks on any token to view details
- **Progression**: Select token → View serial number, denomination, minting metadata → See complete ownership history → Identify potential collector value
- **Success criteria**: All metadata displayed, no duplicate serials possible, rare patterns identifiable

### AI-Powered Minting Strategy Recommendations
- **Functionality**: Analyzes current token distribution, market conditions, and historical patterns to provide intelligent minting recommendations
- **Purpose**: Helps minters make informed decisions about what denominations to mint based on circulation needs, user demand patterns, and economic balance
- **Trigger**: Minter views the minting interface
- **Progression**: System analyzes current state → AI generates recommendations with reasoning → Displays suggested denominations, quantities, and strategic insights → Minter can follow or override suggestions
- **Success criteria**: Recommendations appear within 2 seconds, provide clear rationale, adapt to changing conditions, lead to more balanced token economy

## Edge Case Handling
- **Duplicate Serial Numbers**: System generates cryptographically unique serials and validates before minting
- **Offline Minting**: All transactions queue until GitHub sync available, preventing data loss
- **Non-existent Recipients**: Transfer validates GitHub username existence before allowing completion
- **Minter Authorization**: Only explicitly approved GitHub users can access minting interface
- **Token Deletion**: Tokens cannot be destroyed, only transferred, maintaining economic stability
- **Lost Wallets**: User's GitHub account is the recovery mechanism; tokens persist tied to username

## Design Direction
The design should evoke a vibrant, playful Mario-themed aesthetic that makes financial transactions feel joyful and game-like, while maintaining the professionalism of a currency system. Think Super Mario World meets Federal Reserve - bright primary colors, animated characters presenting data, coin-collecting excitement, and a nostalgic retro gaming feel with modern polish.

## Color Selection
A bold, saturated Mario-inspired palette featuring red, yellow, blue, and green as primary accent colors, set against a rich blue background reminiscent of Mario's sky levels.

- **Primary Color**: Mario Red (oklch(0.55 0.24 30)) - Main brand color for important actions and minting features, communicates energy and excitement like collecting coins
- **Secondary Color**: Luigi Green (oklch(0.45 0.18 145)) - Supporting color for treasury and balance displays, represents growth and the classic Luigi aesthetic
- **Accent Color**: Coin Yellow (oklch(0.75 0.20 85)) - Attention-grabbing highlight for valuable items, CTAs, and currency elements with a golden coin shimmer
- **Background**: Sky Blue (oklch(0.55 0.08 245)) - Main page background with subtle gradient overlays creating a Mario sky atmosphere
- **Card Background**: Brick Orange (oklch(0.60 0.10 25)) - Card containers with warmth reminiscent of Mario's brick blocks
- **Foreground/Background Pairings**:
  - Accent (Coin Yellow): Dark Brown text - Ratio 5.2:1 ✓
  - Primary (Mario Red): White text - Ratio 5.8:1 ✓
  - Secondary (Luigi Green): White text - Ratio 6.4:1 ✓
  - Background (Sky Blue): White text - Ratio 4.6:1 ✓
  - Card (Brick Orange): White text - Ratio 4.9:1 ✓

## Font Selection
Typography should convey official documentation and financial precision with a monospace font for serial numbers and a serious serif for denominations.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Crimson Pro Bold/36px/tight tracking - Official government document feel
  - H2 (Section Headers): Crimson Pro SemiBold/24px/normal tracking
  - H3 (Token Denominations): Crimson Pro Bold/20px/wide tracking - Makes denominations prominent
  - Body Text: Inter Regular/16px/1.5 line height
  - Serial Numbers: JetBrains Mono Medium/14px/tracked spacing - Monospace for authenticity
  - Metadata: Inter Regular/14px/muted color
  - Button Labels: Inter SemiBold/16px/uppercase tracking

## Animations
Animations should bring the Mario universe to life with bouncy, energetic movements and character-driven interactions. Mario and Luigi act as AI guides presenting data with personality.

- Token minting: Coin-flip animation with bounce and sparkle effect (500ms)
- Balance updates: Coin-counting animation with Mario coin sound aesthetic
- Token transfers: Tokens hop from sender to recipient with arc motion (400ms)
- Mario & Luigi characters: Gentle floating animation (infinite loop, 2s cycle) with occasional idle animations
- Chart reveals: Staggered bar growth with playful spring physics (300ms per bar with 50ms delay)
- Hover states: Subtle lift with shadow expansion (150ms) like Mario jumping
- Rare token sparkle: Continuous twinkle animation with rotating sparkles
- Tab transitions: Slide in from direction with slight overshoot bounce (250ms)

## Component Selection

- **Components**:
  - `Card` - Token displays, wallet summaries, minting interface (modified with border-2 and shadow-lg for substantial feel)
  - `Dialog` - Minting confirmation, transfer modals, token detail views
  - `Table` - Global ledger, transaction history with striped rows
  - `Tabs` - Navigation between Wallet, Mint, Ledger, History
  - `Input` - GitHub username entry, search fields (with green focus rings)
  - `Select` - Denomination picker for minting
  - `Button` - Primary actions in green, secondary in blue, destructive unused (no deletion allowed)
  - `Badge` - Denomination labels ($1, $5, etc.) with color coding
  - `Avatar` - GitHub user profile pictures in wallet/ledger
  - `ScrollArea` - Long token lists and transaction histories
  - `Separator` - Visual breaks between major sections
  - `Tooltip` - Explanatory text for serial number patterns, collector value

- **Customizations**:
  - Custom token card component with watermark-style background pattern (repeating dollar signs in subtle texture)
  - Serial number component with monospace font and subtle highlight for rare patterns
  - Balance display component that shows total value and breakdown by denomination
  - Transaction timeline component showing token journey with connecting lines

- **States**:
  - Buttons: Solid fill on default, subtle scale on hover (1.02), pressed state with inner shadow, disabled with opacity
  - Inputs: Thin border default, thick green border on focus, error state with red border
  - Token cards: Flat default, elevated shadow on hover, selected state with green outline
  - Transfer actions: Loading spinner during GitHub sync, success checkmark with green pulse

- **Icon Selection**:
  - `Coins` - Wallet balance, token overview
  - `Printer` - Minting interface
  - `ArrowsLeftRight` - Transfers and transactions
  - `ListNumbers` - Serial numbers, ledger entries
  - `Scroll` - Transaction history, ledger
  - `Seal` - Minter authorization badge
  - `MapPin` - Token minting location
  - `Sparkle` - Rare serial number indicator
  - `User` - GitHub user identification
  - `Check` - Transaction confirmation

- **Spacing**:
  - Section padding: p-8 (desktop), p-4 (mobile)
  - Card padding: p-6
  - Element gaps: gap-4 for related items, gap-8 for major sections
  - Grid layouts: grid-cols-1 (mobile), grid-cols-2 (tablet), grid-cols-3 (desktop) for token displays
  - List spacing: space-y-3 for transaction entries

- **Mobile**:
  - Tabs collapse to dropdown menu on mobile
  - Token cards stack vertically in single column
  - Table becomes card-based list with key information prioritized
  - Minting interface becomes multi-step wizard instead of single form
  - Transfer dialog uses full-screen overlay on small screens
  - Serial numbers wrap gracefully with preserved monospace alignment
