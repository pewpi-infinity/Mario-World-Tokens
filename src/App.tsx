import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Coins } from '@phosphor-icons/react'
import { MintingInterface } from '@/components/MintingInterface'
import { WalletBalance } from '@/components/WalletBalance'
import { TreasuryCharts } from '@/components/TreasuryCharts'
import { GlobalLedger } from '@/components/GlobalLedger'
import { TokenCard } from '@/components/TokenCard'
import { Marketplace } from '@/components/Marketplace'
import { AnimatedMarioButtons } from '@/components/AnimatedMarioButtons'
import { MarioLogo } from '@/components/MarioLogo'
import { MarioBrickTabs } from '@/components/MarioBrickTabs'
import { QuickTuneChanger } from '@/components/QuickTuneChanger'
import { UnifiedMusicStudio } from '@/components/UnifiedMusicStudio'
import { CollaborativeMusicStudio } from '@/components/CollaborativeMusicStudio'
import { MarioArtStudio } from '@/components/MarioArtStudio'
import { MarioRaceTrack } from '@/components/MarioRaceTrack'
import { GameEmulatorBuilder, type ResearchTokenDraft } from '@/components/GameEmulatorBuilder'
import { InfinityAIChat } from '@/components/InfinityAIChat'
import { HomepageAIDesigner } from '@/components/HomepageAIDesigner'
import { MarioJukebox } from '@/components/MarioJukebox'
import { TreasuryFeed } from '@/components/TreasuryFeed'
import { MarioCoin, TreasuryStats } from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
// Sound effects disabled - jukebox handles audio
// Background music disabled - jukebox handles music
import marioImage from '@/assets/images/Screenshot_20260225-192747.png'

const sanitizeUserId = (value: string) => value.trim().replace(/[^a-zA-Z0-9-]/g, '').slice(0, 39)
const sanitizeRepoName = (value: string) => value.trim().replace(/[^a-zA-Z0-9._-]/g, '')
const encodeBase64 = (value: string) => btoa(unescape(encodeURIComponent(value)))
const decodeBase64 = (value: string) => decodeURIComponent(escape(atob(value)))
interface TokenScriptEvent {
  coinId: string
  mintedBy: string
  mintedAt: number
  source: 'manual' | 'research' | 'historical'
  recordedAt: string
  coin: MarioCoin
}

interface GitHubSyncSettings {
  owner: string
  repo: string
  branch: string
  filePath: string
  token: string
}

const DEFAULT_GITHUB_SYNC_SETTINGS: GitHubSyncSettings = {
  owner: 'pewpi-infinity',
  repo: 'Mario-World-Tokens',
  branch: 'main',
  filePath: 'data/token-mint-script.js',
  token: ''
}

interface SparkClient {
  user?: () => Promise<{ login?: string }>
  getUser?: () => Promise<{ login?: string }>
  auth?: {
    user?: () => Promise<{ login?: string }>
  }
  login?: () => Promise<void>
}

function App() {
  const [coins, setCoins] = useKV<MarioCoin[]>('mario-coins', [])
  const [globalCoins, setGlobalCoins] = useKV<MarioCoin[]>('global-mario-coins', [])
  const [userResearchDictionary, setUserResearchDictionary] = useKV<Record<string, string[]>>('user-research-dictionary', {})
  const [treasuryResearchNotes, setTreasuryResearchNotes] = useKV<Record<string, string>>('treasury-research-notes', {})
  const [activeTab, setActiveTab] = useState('treasury')
  const [showMinting, setShowMinting] = useState(false)
  const [showMusicStudio, setShowMusicStudio] = useState(false)
  const [showCollabMusic, setShowCollabMusic] = useState(false)
  const [showArtStudio, setShowArtStudio] = useState(false)
  const [showRaceTrack, setShowRaceTrack] = useState(false)
  const [showGameBuilder, setShowGameBuilder] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showJukebox, setShowJukebox] = useState(false)
  const [showGitHubSyncConfig, setShowGitHubSyncConfig] = useState(false)
  const hasBackfilledTokenScriptRef = useRef(false)
  const [jukeboxPlaying, setJukeboxPlaying] = useState(false)
  const [jukeboxSong, setJukeboxSong] = useState('')
  const [tokenScriptEvents, setTokenScriptEvents] = useKV<TokenScriptEvent[]>('token-script-events', [])
  const [githubSyncSettings, setGitHubSyncSettings] = useKV<GitHubSyncSettings>('github-sync-settings', DEFAULT_GITHUB_SYNC_SETTINGS)
  const [githubSyncDraft, setGitHubSyncDraft] = useState<GitHubSyncSettings>(DEFAULT_GITHUB_SYNC_SETTINGS)
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = sanitizeUserId(localStorage.getItem('mario-current-user')?.trim() || '')
    if (!storedUser || storedUser.startsWith('guest-')) return ''
    return storedUser
  })
  const [githubLogin, setGithubLogin] = useState<string | null>(null)
  const [isGithubLoginPending, setIsGithubLoginPending] = useState(false)


  const openGameEmulator = () => {
    setShowGameBuilder(true)
    toast.success('🕹️ Game Builder & Mario-3 Emulator activated!', {
    })
  }

  const exportTreasuryNotes = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      tokenCount: (coins || []).length,
      dictionary: userResearchDictionary || {},
      notes: treasuryResearchNotes || {}
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'treasury-notes.json'
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('📁 Treasury notes exported for repository commit')
  }

  const buildTokenScriptBody = (events: TokenScriptEvent[]) => [
      '/**',
      ' * Mario World Tokens - Auto-generated token mint script.',
      ' * This file grows whenever a new token is minted.',
      ' */',
      'window.__MARIO_TOKEN_SCRIPT__ = window.__MARIO_TOKEN_SCRIPT__ || [];',
      ...events.map((event) => `window.__MARIO_TOKEN_SCRIPT__.push(${JSON.stringify(event)});`)
    ].join('\n')

  const parseTokenScriptEvents = (content: string): TokenScriptEvent[] => {
    const events: TokenScriptEvent[] = []
    const pushMatches = content.matchAll(/window\.__MARIO_TOKEN_SCRIPT__\.push\((.*)\);/g)
    for (const match of pushMatches) {
      const payload = match[1]?.trim()
      if (!payload) continue
      try {
        const parsed = JSON.parse(payload) as TokenScriptEvent
        if (parsed?.coinId) {
          events.push(parsed)
        }
      } catch {
        // Ignore malformed historical lines
      }
    }
    return events
  }

  const mergeTokenScriptEvents = (sourceEvents: TokenScriptEvent[]) => {
    const byCoinId = new Map<string, TokenScriptEvent>()
    sourceEvents.forEach((event) => {
      if (!event?.coinId) return
      byCoinId.set(event.coinId, event)
    })
    return Array.from(byCoinId.values()).sort((a, b) => a.mintedAt - b.mintedAt)
  }

  const resolveGithubLogin = async (sparkClient: SparkClient): Promise<string> => {
    const providers = [sparkClient.user, sparkClient.getUser, sparkClient.auth?.user]
    for (const provider of providers) {
      if (!provider) continue
      try {
        const user = await provider()
        const safeLogin = sanitizeUserId(user?.login || '')
        if (safeLogin) return safeLogin
      } catch {
        // Try next provider
      }
    }
    return ''
  }

  const exportUserTokens = () => {
    const events = tokenScriptEvents || []
    const scriptBody = buildTokenScriptBody(events)
    const blob = new Blob([scriptBody], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    const safeFileUser = sanitizeUserId(currentUser) || 'user'
    anchor.download = `${safeFileUser}-token-script.js`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('🗂️ Token script exported')
  }

  const syncTokenScriptToGitHub = async (events: TokenScriptEvent[], mintedCoin: MarioCoin) => {
    if (!githubSyncSettings?.token?.trim()) return

    const owner = sanitizeUserId(githubSyncSettings.owner || '')
    const repo = sanitizeRepoName(githubSyncSettings.repo || '')
    const branch = (githubSyncSettings.branch || '').trim() || 'main'
    const path = (githubSyncSettings.filePath || '').trim()
    if (!owner || !repo || !path) return

    const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}`
    const headers = {
      Authorization: `Bearer ${githubSyncSettings.token.trim()}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    }

    let sha: string | undefined
    let remoteEvents: TokenScriptEvent[] = []
    const currentFileResponse = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, { headers })
    if (currentFileResponse.ok) {
      const currentFile = await currentFileResponse.json()
      sha = currentFile.sha
      if (typeof currentFile.content === 'string') {
        try {
          const decodedContent = decodeBase64(currentFile.content.replace(/\n/g, ''))
          remoteEvents = parseTokenScriptEvents(decodedContent)
        } catch {
          remoteEvents = []
        }
      }
    } else if (currentFileResponse.status !== 404) {
      const errorText = await currentFileResponse.text()
      throw new Error(`Unable to read token script file (${currentFileResponse.status}): ${errorText || currentFileResponse.statusText}`)
    }

    const mergedEvents = mergeTokenScriptEvents([...remoteEvents, ...events])

    const putResponse = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `chore(tokens): append ${mintedCoin.id} by ${mintedCoin.mintedBy}`,
        content: encodeBase64(buildTokenScriptBody(mergedEvents)),
        branch,
        sha
      })
    })

    if (!putResponse.ok) {
      const errorText = await putResponse.text()
      throw new Error(`GitHub commit failed (${putResponse.status}): ${errorText || putResponse.statusText}`)
    }
  }

  const recordTokenScriptEvent = (coin: MarioCoin, source: 'manual' | 'research') => {
    const event: TokenScriptEvent = {
      coinId: coin.id,
      mintedBy: coin.mintedBy,
      mintedAt: coin.mintedAt,
      source,
      recordedAt: new Date().toISOString(),
      coin
    }

    let nextEvents: TokenScriptEvent[] = tokenScriptEvents || []
    let appended = false
    setTokenScriptEvents((current) => {
      const existing = current || []
      if (existing.some((item) => item.coinId === coin.id)) {
        nextEvents = existing
        return existing
      }
      appended = true
      nextEvents = [...existing, event]
      return nextEvents
    })

    if (!appended) return

    if (githubSyncSettings?.token?.trim()) {
      void syncTokenScriptToGitHub(nextEvents, coin)
        .then(() => {
          toast.success('✅ Token script synced to GitHub')
        })
        .catch((error) => {
          console.error('GitHub sync failed:', error)
          toast.error('GitHub sync failed. Check sync settings and token permissions. Token is still saved locally.')
        })
    }
  }

  const openGitHubSyncConfig = () => {
    setGitHubSyncDraft(githubSyncSettings || DEFAULT_GITHUB_SYNC_SETTINGS)
    setShowGitHubSyncConfig(true)
  }

  const saveGitHubSyncConfig = () => {
    setGitHubSyncSettings({
      owner: githubSyncDraft.owner.trim() || DEFAULT_GITHUB_SYNC_SETTINGS.owner,
      repo: githubSyncDraft.repo.trim() || DEFAULT_GITHUB_SYNC_SETTINGS.repo,
      branch: githubSyncDraft.branch.trim() || DEFAULT_GITHUB_SYNC_SETTINGS.branch,
      filePath: githubSyncDraft.filePath.trim() || DEFAULT_GITHUB_SYNC_SETTINGS.filePath,
      token: githubSyncDraft.token.trim()
    })
    setShowGitHubSyncConfig(false)
    toast.success(githubSyncDraft.token.trim() ? '🔐 GitHub sync secret saved' : 'GitHub sync disabled (no token)')
  }

  
  
  


  useEffect(() => {
    let mounted = true
    const attemptGithubUser = async () => {
      const sparkClient = window.spark as SparkClient
      setIsGithubLoginPending(true)
      let safeLogin = await resolveGithubLogin(sparkClient)
      if (!safeLogin && sparkClient.login) {
        try {
          await sparkClient.login()
          safeLogin = await resolveGithubLogin(sparkClient)
        } catch {
          // User can sign in manually
        }
      }
      if (!mounted || !safeLogin) return
      setGithubLogin(safeLogin)
      setCurrentUser(safeLogin)
      localStorage.setItem('mario-current-user', safeLogin)
    }
    attemptGithubUser().catch(() => {
      // User can sign in manually
    }).finally(() => {
      if (mounted) {
        setIsGithubLoginPending(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  const handleGithubLogin = async () => {
    const sparkClient = window.spark as SparkClient
    if (!sparkClient.login) {
      toast.error('GitHub login is unavailable in this environment.')
      return
    }

    try {
      setIsGithubLoginPending(true)
      await sparkClient.login()
      const safeLogin = await resolveGithubLogin(sparkClient)
      if (!safeLogin) {
        toast.error('GitHub login did not return a valid username.')
        return
      }

      setGithubLogin(safeLogin)
      setCurrentUser(safeLogin)
      localStorage.setItem('mario-current-user', safeLogin)
      toast.success(`Signed in as @${safeLogin}`)
    } catch {
      toast.error('GitHub login failed. Please try again.')
    } finally {
      setIsGithubLoginPending(false)
    }
  }
  
  const getCurrentContext = () => {
    switch (activeTab) {
      case 'treasury':
        return 'Treasury - viewing and managing user coins'
      case 'marketplace':
        return 'Marketplace - trading and transferring tokens'
      case 'charts':
        return 'Charts - viewing treasury analytics and statistics'
      case 'ledger':
        return 'Global Ledger - viewing all transactions across the system'
      default:
        return 'Mario World Tokens - main dashboard'
    }
  }

  const walletCoins = (coins || []).filter((coin) => coin.mintedBy === currentUser)
  const treasuryCoins = globalCoins || []

  useEffect(() => {
    if (hasBackfilledTokenScriptRef.current) return
    if ((tokenScriptEvents || []).length > 0 || treasuryCoins.length === 0) return
    hasBackfilledTokenScriptRef.current = true
    setTokenScriptEvents(
      treasuryCoins.map((coin) => ({
        coinId: coin.id,
        mintedBy: coin.mintedBy,
        mintedAt: coin.mintedAt,
        source: 'historical',
        recordedAt: new Date().toISOString(),
        coin
      }))
    )
  }, [tokenScriptEvents, treasuryCoins, setTokenScriptEvents])

  const markTokenAsPrinted = (coinId: string) => {
    const applyPrintedUpdate = (coin: MarioCoin) => {
      const alreadyPrinted = coin.transferHistory.some((entry) => entry.receiptPrinted)
      if (alreadyPrinted) return coin
      return {
        ...coin,
        transferHistory: [
          ...coin.transferHistory,
          {
            from: coin.mintedBy,
            to: coin.mintedBy,
            timestamp: Date.now(),
            note: 'Receipt printed and committed to wallet page records',
            receiptPrinted: true
          }
        ]
      }
    }

    setCoins((current) => (current || []).map((coin) => coin.id === coinId ? applyPrintedUpdate(coin) : coin))
    setGlobalCoins((current) => (current || []).map((coin) => coin.id === coinId ? applyPrintedUpdate(coin) : coin))
  }

  const treasuryStats: TreasuryStats = {
    totalValue: treasuryCoins.reduce((sum, coin) => sum + coin.value, 0),
    coinCount: treasuryCoins.length,
    printedUsableTokenCount: treasuryCoins.filter((coin) => coin.transferHistory.some((entry) => entry.receiptPrinted)).length,
    contentBreakdown: treasuryCoins.reduce((acc, coin) => {
      acc[coin.content.type] = (acc[coin.content.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    mintingHistory: treasuryCoins
      .sort((a, b) => a.mintedAt - b.mintedAt)
      .map((coin, index, arr) => ({
        timestamp: coin.mintedAt,
        value: coin.value,
        totalValue: arr.slice(0, index + 1).reduce((sum, c) => sum + c.value, 0)
      }))
  }

  const handleMint = (newCoin: MarioCoin) => {
    setCoins((current) => [...(current || []), newCoin])
    setGlobalCoins((current) => [...(current || []), newCoin])
    recordTokenScriptEvent(newCoin, 'manual')
    setShowMinting(false)
    toast.success('Mario Coin Minted!', {
      description: `$${newCoin.value.toFixed(2)} backed by ${newCoin.content.type}`
    })
  }

  useEffect(() => {
    if (walletCoins.length === 0 && activeTab === 'treasury') {
      const timer = setTimeout(() => {
        toast.info('Start Minting!', {
          description: 'Click "Mint New Coin" to create your first Mario Currency',
          duration: 5000
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [walletCoins.length, activeTab])

  const handleTransfer = (from: string, to: string, coin: MarioCoin) => {
    const updatedCoin = {
      ...coin,
      mintedBy: to,
      transferHistory: [
        ...coin.transferHistory,
        {
          from,
          to,
          timestamp: Date.now()
        }
      ]
    }

    if (from === currentUser) {
      setCoins((current) => (current || []).filter(c => c.id !== coin.id))
    } else {
      setCoins((current) => [...(current || []), updatedCoin])
    }

    setGlobalCoins((current) => {
      const updated = (current || []).map(c => c.id === coin.id ? updatedCoin : c)
      return updated
    })
  }

  const handleResearchTokenCollected = (token: ResearchTokenDraft) => {
    const treasuryNote = `${token.gameTitle} coin #${token.coinCount}: ${token.description}`
    setUserResearchDictionary((current) => {
      const next = { ...(current || {}) }
      token.keywords.forEach((keyword) => {
        const normalizedKeyword = keyword.toLowerCase()
        const existingLinks = next[normalizedKeyword] || []
        next[normalizedKeyword] = Array.from(new Set([...existingLinks, ...token.researchLinks]))
      })
      return next
    })
    setTreasuryResearchNotes((current) => ({
      ...(current || {}),
      [token.id]: treasuryNote
    }))

    const newCoin: MarioCoin = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `coin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      value: Math.max(0.25, token.coinCount * 0.1),
      mintedAt: Date.now(),
      mintedBy: currentUser,
      content: {
        type: 'text',
        title: token.title,
        description: `${token.description} Sources: ${token.researchLinks.join(', ')}`,
        data: JSON.stringify({
          game: token.gameTitle,
          keywords: token.keywords,
          score: token.score,
          researchLinks: token.researchLinks,
          treasuryNote
        })
      },
      transferHistory: []
    }

    setCoins((current) => [...(current || []), newCoin])
    setGlobalCoins((current) => [...(current || []), newCoin])
    recordTokenScriptEvent(newCoin, 'research')
  }

  const handleActionButtons = {
    onTimeCapsule: (secret: string, releaseDate: Date) => {
      toast.success(`🧱 Time Capsule Created! Opens ${releaseDate.toLocaleDateString()}`)
    },
    onMintToken: () => {
      setShowMinting(true)
    },
    onUpgradeToken: (tokenId: string) => {
      toast.info('⚪ Platinum upgrade initiated - AI analyzing token...')
    },
    onVideoClip: () => {
      toast.success('🎬 AI just clipped a video of you in Mario World for a CentCom movie!')
    },
    onFilmRolling: () => {
      toast.info('📽️ The film is rolling! This is going to be a cool process.')
    },
    onSuperPower: () => {
      toast.success('👻 Super powers activated! Become a faster runner or ship in other realms!')
    },
    onSocialShare: (tokenId: string) => {
      toast.success('🤑 Token shared to all logged and synced social media!')
    },
    onMemoryPull: (tokenId: string) => {
      toast.info('🧲 Pulling token memory... Building new 🟡 and leaving platinum ⚪ behind')
    },
    onCreationZone: () => {
      setShowArtStudio(true)
      toast.success('👽 Creation Zone activated! Build anything you imagine!')
    },
    onFirePower: (offerId: string) => {
      toast.success('🌻 Fire power denied the bad offer! 🔥')
    },
    onMusicCreation: () => {
      setShowMusicStudio(true)
    },
    onCollabMusic: () => {
      setShowCollabMusic(true)
    },
    onValueJump: (fromValue: number, toValue: number) => {
      openGameEmulator()
    },
    onLivingToken: () => {
      toast.success('⭐ Living Token created! Community + AI updates enabled')
    },
    onDoubleUp: () => {
      toast.success('🍄 Luigi partner added! Currency doubled with partner system!')
    },
    onAIAssistant: () => {
      setShowAIAssistant(true)
      toast.success('♾️ Infinity AI Network activated!')
    },
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-[oklch(0.75_0.18_85)] bg-gradient-to-r from-[oklch(0.58_0.24_330)] via-[oklch(0.65_0.25_265)] to-[oklch(0.70_0.24_190)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(1_0_0_/_0.05)_10px,oklch(1_0_0_/_0.05)_20px)]"></div>
        <div className="w-full px-2 sm:px-4 py-3 sm:py-6 relative z-10 space-y-2 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="bg-[oklch(0.75_0.18_85)] p-2 sm:p-3 rounded-lg shadow-lg border-2 border-[oklch(0.85_0.20_85)] flex-shrink-0">
              <MarioLogo animated />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl md:text-3xl font-bold text-white drop-shadow-lg pixel-font leading-tight">
                MARIO WORLD TOKENS
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[oklch(0.75_0.18_85)] font-semibold drop-shadow truncate">
                People's Treasury 🪙
              </p>
              <p className="text-xs text-white/90 font-medium drop-shadow truncate">
                {githubLogin ? `Signed in with GitHub as @${githubLogin}` : 'Sign in with GitHub to access your wallet'}
              </p>
              {!githubLogin && (
                <Button
                  size="sm"
                  onClick={handleGithubLogin}
                  disabled={isGithubLoginPending}
                  className="mt-2 h-7 text-xs bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)]"
                >
                  {isGithubLoginPending ? 'Connecting...' : 'Sign in with GitHub'}
                </Button>
              )}
            </div>
          </div>
          
          <AnimatedMarioButtons
            onTimeCapsule={handleActionButtons.onTimeCapsule}
            onMintToken={handleActionButtons.onMintToken}
            onUpgradeToken={handleActionButtons.onUpgradeToken}
            onVideoClip={handleActionButtons.onVideoClip}
            onFilmRolling={handleActionButtons.onFilmRolling}
            onSuperPower={handleActionButtons.onSuperPower}
            onSocialShare={handleActionButtons.onSocialShare}
            onMemoryPull={handleActionButtons.onMemoryPull}
            onCreationZone={handleActionButtons.onCreationZone}
            onFirePower={handleActionButtons.onFirePower}
            onMusicCreation={handleActionButtons.onMusicCreation}
            onCollabMusic={handleActionButtons.onCollabMusic}
            onValueJump={handleActionButtons.onValueJump}
            onLivingToken={handleActionButtons.onLivingToken}
            onDoubleUp={handleActionButtons.onDoubleUp}
            onAIAssistant={handleActionButtons.onAIAssistant}
          />
        </div>
      </header>

      <main className="w-full px-2 sm:px-4 py-4 sm:py-8 max-w-7xl mx-auto">
        <WalletBalance stats={treasuryStats} />

        <MarioBrickTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <QuickTuneChanger activeTab={activeTab} />

        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          <Button onClick={openGameEmulator} className="bg-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.75_0.26_190)]">
            🕹️ Open Emulator
          </Button>
          <Button onClick={exportTreasuryNotes} variant="outline">
            💾 Export Treasury Notes
          </Button>
          <Button onClick={exportUserTokens} variant="outline">
            🗂️ Export My Tokens
          </Button>
        </div>

        <div className="mt-4 sm:mt-8">
          {activeTab === 'treasury' && (
            <>
              <TreasuryFeed globalCoins={treasuryCoins} stats={treasuryStats} />

              <Card className="p-4 sm:p-6 bg-card border-2 border-border mt-4">
                <h3 className="text-lg sm:text-xl font-bold mb-4">My Wallet</h3>
                {walletCoins.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {githubLogin
                      ? 'No wallet tokens yet. Mint a token to start your personal wallet history.'
                      : 'Sign in with GitHub to connect your wallet profile and token history.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {walletCoins.map((coin) => (
                      <TokenCard
                        key={`wallet-${coin.id}`}
                        coin={coin}
                        onReceiptPrinted={markTokenAsPrinted}
                        onTransfer={(coinId) => {
                          toast.info('Transfer feature coming soon!')
                        }}
                      />
                    ))}
                  </div>
                )}
              </Card>

              {treasuryCoins.length === 0 ? (
                <Card className="p-6 sm:p-12 text-center bg-card border-2 border-border mt-4">
                  <div className="max-w-md mx-auto">
                    <Coins size={48} className="sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" weight="fill" />
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">No Coins Yet</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-6">
                      Start minting Mario Coins backed by your creative content. You are your own central bank!
                    </p>
                    <Button
                      size="lg"
                      onClick={() => setShowMinting(true)}
                      className="bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)] w-full sm:w-auto"
                    >
                      <span>🟡 Mint Your First Coin</span>
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="mt-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-4">Treasury (All Users)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {treasuryCoins.map((coin) => (
                      <TokenCard
                        key={coin.id}
                        coin={coin}
                        onReceiptPrinted={markTokenAsPrinted}
                        onTransfer={(coinId) => {
                          toast.info('Transfer feature coming soon!')
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'marketplace' && (
            <Marketplace
              userCoins={walletCoins}
              currentUser={currentUser}
              onTransferComplete={handleTransfer}
            />
          )}

          {activeTab === 'charts' && (
            <TreasuryCharts stats={treasuryStats} marioLogo={marioImage} />
          )}

          {activeTab === 'ledger' && (
            <GlobalLedger globalCoins={globalCoins || []} />
          )}
        </div>
      </main>

      <MintingInterface
        open={showMinting}
        onClose={() => setShowMinting(false)}
        onMint={handleMint}
        currentUser={currentUser}
      />

      <UnifiedMusicStudio
        open={showMusicStudio}
        onClose={() => setShowMusicStudio(false)}
        onMintMusic={handleMint}
        currentUser={currentUser}
      />

      <CollaborativeMusicStudio
        open={showCollabMusic}
        onClose={() => setShowCollabMusic(false)}
        onMintMusic={handleMint}
        currentUser={currentUser}
      />

      <MarioArtStudio
        open={showArtStudio}
        onClose={() => setShowArtStudio(false)}
        onMintArt={handleMint}
        currentUser={currentUser}
      />

      <MarioRaceTrack
        open={showRaceTrack}
        onClose={() => setShowRaceTrack(false)}
      />

      <GameEmulatorBuilder
        open={showGameBuilder}
        onClose={() => setShowGameBuilder(false)}
        onCollectResearchToken={handleResearchTokenCollected}
      />

      <InfinityAIChat
        open={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        initialBot="builder"
      />

      <MarioJukebox
        open={showJukebox}
        onClose={() => setShowJukebox(false)}
        onPlayStateChange={(playing, song) => {
          setJukeboxPlaying(playing)
          setJukeboxSong(song)
        }}
      />

      {/* Mario ? Block */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Question Block"
            className="fixed bottom-5 right-5 w-16 h-16 flex items-center justify-center cursor-pointer z-50 transition-transform hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(180deg, oklch(0.82 0.19 85) 0%, oklch(0.68 0.17 80) 100%)',
              borderRadius: '6px',
              border: '3px solid oklch(0.55 0.14 75)',
              boxShadow: '0 5px 0 oklch(0.50 0.13 70), inset 0 2px 0 oklch(0.90 0.15 88), inset 0 -2px 0 oklch(0.55 0.14 75), 0 8px 24px oklch(0 0 0 / 0.35)',
            }}
          >
            <div className="absolute inset-0 rounded" style={{
              background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 6px, oklch(0 0 0 / 0.06) 6px, oklch(0 0 0 / 0.06) 7px), repeating-linear-gradient(90deg, transparent 0px, transparent 6px, oklch(0 0 0 / 0.06) 6px, oklch(0 0 0 / 0.06) 7px)',
              pointerEvents: 'none',
            }} />
            <span className="relative z-10 text-3xl font-black drop-shadow-lg" style={{
              color: 'oklch(0.98 0.01 90)',
              textShadow: '1px 1px 0 oklch(0.45 0.12 75), -1px -1px 0 oklch(0.45 0.12 75), 1px -1px 0 oklch(0.45 0.12 75), -1px 1px 0 oklch(0.45 0.12 75)',
              fontFamily: "'Press Start 2P', monospace",
            }}>?</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-64 mb-2">
          <DropdownMenuLabel className="pixel-font text-xs">Tools</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowJukebox(true)}>
            <span className="mr-2">{jukeboxPlaying ? '🎵' : '🎧'}</span>
            {jukeboxPlaying ? 'Jukebox: ' + jukeboxSong : 'Jukebox'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowMinting(true)}>{'🟡'} Mint Token</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowMusicStudio(true)}>{'🎹'} Music Studio</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowCollabMusic(true)}>{'🎸'} Collab Music</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowArtStudio(true)}>{'🎨'} Art Studio</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowRaceTrack(true)}>{'🏎'} Race Track</DropdownMenuItem>
          <DropdownMenuItem onClick={() => openGameEmulator()}>{'🕹'} Emulator</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowAIAssistant(true)}>{'♾'} AI Assistant</DropdownMenuItem>
          <DropdownMenuItem onClick={openGitHubSyncConfig}>
            {'🔐'} Configure GitHub Sync
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="pixel-font text-xs">Pages</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => window.open('https://pewpi-infinity.github.io/MARIO-TOKENS/#bot-panel','_blank','noopener,noreferrer')}>{'🤖'} Bot Panel</DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open('https://pewpi-infinity.github.io/MARIO-TOKENS/#treasury','_blank','noopener,noreferrer')}>{'🪙'} Treasury</DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open('https://pewpi-infinity.github.io/MARIO-TOKENS/#marketplace','_blank','noopener,noreferrer')}>{'🛒'} Marketplace</DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open('https://pewpi-infinity.github.io/smug_look/mario-jukebox.html','_blank','noopener,noreferrer')}>{'🎼'} Classic Jukebox</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showGitHubSyncConfig} onOpenChange={setShowGitHubSyncConfig}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>GitHub Sync Secret</DialogTitle>
            <DialogDescription>
              Configure where token script updates are committed whenever new tokens are minted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="github-owner">Owner</Label>
              <Input
                id="github-owner"
                value={githubSyncDraft.owner}
                onChange={(event) => setGitHubSyncDraft((current) => ({ ...current, owner: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="github-repo">Repository</Label>
              <Input
                id="github-repo"
                value={githubSyncDraft.repo}
                onChange={(event) => setGitHubSyncDraft((current) => ({ ...current, repo: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="github-branch">Branch</Label>
              <Input
                id="github-branch"
                value={githubSyncDraft.branch}
                onChange={(event) => setGitHubSyncDraft((current) => ({ ...current, branch: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="github-file">File Path</Label>
              <Input
                id="github-file"
                value={githubSyncDraft.filePath}
                onChange={(event) => setGitHubSyncDraft((current) => ({ ...current, filePath: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="github-token">GitHub Token</Label>
              <Input
                id="github-token"
                type="password"
                value={githubSyncDraft.token}
                onChange={(event) => setGitHubSyncDraft((current) => ({ ...current, token: event.target.value }))}
                placeholder="ghp_..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowGitHubSyncConfig(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveGitHubSyncConfig}>
              Save Sync Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
      
      <HomepageAIDesigner />
    </div>
  )
}

export default App
