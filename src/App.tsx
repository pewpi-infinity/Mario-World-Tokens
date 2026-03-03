import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
import { MarioCoin, TreasuryStats } from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { preloadAllSounds, playCoinSound, playOneUp, playPowerUp, initializeAudioContext, playPipe, playFireball, playKick, playStageClear, playJump, playStomp, forceUnlockAudio } from '@/lib/sounds'
import { initBackgroundMusic, playBackgroundMusic, enableAutoPlay, BackgroundMusicPage } from '@/lib/background-music'
import marioImage from '@/assets/images/Screenshot_20260225-192747.png'

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
  const [currentUser] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`)
  const pageMap: Record<string, BackgroundMusicPage> = {
    treasury: 'treasury',
    marketplace: 'marketplace',
    charts: 'charts',
    ledger: 'ledger'
  }

  const openGameEmulator = () => {
    playJump()
    setShowGameBuilder(true)
    toast.success('🕹️ Game Builder & Mario-3 Emulator activated!')
  }

  const exportTreasuryNotes = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      tokenCount: userCoins.length,
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

  const activateAudioSystem = () => {
    initializeAudioContext()
    forceUnlockAudio()
    enableAutoPlay()
    playBackgroundMusic(pageMap[activeTab] || 'main')
    playCoinSound()
    toast.success('🔊 Sound & music enabled!')
  }
  
  useEffect(() => {
    console.log('🎮 MARIO WORLD AUDIO SYSTEM INITIALIZING...')
    
    initializeAudioContext()
    preloadAllSounds()
    initBackgroundMusic('main')
    
    const events = ['click', 'keydown', 'touchstart', 'mousedown', 'pointerdown', 'touchend']
    const handler = () => {
      activateAudioSystem()
      events.forEach(e => document.removeEventListener(e, handler, { capture: true }))
    }
    
    events.forEach(e => {
      document.addEventListener(e, handler, { capture: true })
    })
    
    return () => {
      events.forEach(e => document.removeEventListener(e, handler, { capture: true }))
    }
  }, [])
  
  useEffect(() => {
    const page = pageMap[activeTab] || 'main'
    playBackgroundMusic(page)
  }, [activeTab])
  
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

  const userCoins = coins || []

  const treasuryStats: TreasuryStats = {
    totalValue: userCoins.reduce((sum, coin) => sum + coin.value, 0),
    coinCount: userCoins.length,
    contentBreakdown: userCoins.reduce((acc, coin) => {
      acc[coin.content.type] = (acc[coin.content.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    mintingHistory: userCoins
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
    setShowMinting(false)
    playCoinSound()
    toast.success('Mario Coin Minted!', {
      description: `$${newCoin.value.toFixed(2)} backed by ${newCoin.content.type}`
    })
  }

  useEffect(() => {
    if (userCoins.length === 0 && activeTab === 'treasury') {
      const timer = setTimeout(() => {
        toast.info('Start Minting!', {
          description: 'Click "Mint New Coin" to create your first Mario Currency',
          duration: 5000
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [userCoins.length, activeTab])

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
  }

  const handleActionButtons = {
    onTimeCapsule: (secret: string, releaseDate: Date) => {
      playPipe()
      toast.success(`🧱 Time Capsule Created! Opens ${releaseDate.toLocaleDateString()}`)
    },
    onMintToken: () => {
      playCoinSound()
      setShowMinting(true)
    },
    onUpgradeToken: (tokenId: string) => {
      playPowerUp()
      toast.info('⚪ Platinum upgrade initiated - AI analyzing token...')
    },
    onVideoClip: () => {
      playStomp()
      toast.success('🎬 AI just clipped a video of you in Mario World for a CentCom movie!')
    },
    onFilmRolling: () => {
      playStomp()
      toast.info('📽️ The film is rolling! This is going to be a cool process.')
    },
    onSuperPower: () => {
      playOneUp()
      toast.success('👻 Super powers activated! Become a faster runner or ship in other realms!')
    },
    onSocialShare: (tokenId: string) => {
      playCoinSound()
      toast.success('🤑 Token shared to all logged and synced social media!')
    },
    onMemoryPull: (tokenId: string) => {
      playKick()
      toast.info('🧲 Pulling token memory... Building new 🟡 and leaving platinum ⚪ behind')
    },
    onCreationZone: () => {
      playPowerUp()
      setShowArtStudio(true)
      toast.success('👽 Creation Zone activated! Build anything you imagine!')
    },
    onFirePower: (offerId: string) => {
      playFireball()
      toast.success('🌻 Fire power denied the bad offer! 🔥')
    },
    onMusicCreation: () => {
      playJump()
      setShowMusicStudio(true)
    },
    onCollabMusic: () => {
      playJump()
      setShowCollabMusic(true)
    },
    onValueJump: (fromValue: number, toValue: number) => {
      openGameEmulator()
    },
    onLivingToken: () => {
      playStageClear()
      toast.success('⭐ Living Token created! Community + AI updates enabled')
    },
    onDoubleUp: () => {
      playOneUp()
      toast.success('🍄 Luigi partner added! Currency doubled with partner system!')
    },
    onAIAssistant: () => {
      playPipe()
      setShowAIAssistant(true)
      toast.success('♾️ Infinity AI Network activated!')
    },
    onJukebox: () => {
      playJump()
      setShowJukebox(true)
      toast.success('🎧 Mario Jukebox activated! Enjoy classic tunes!')
    }
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
            onJukebox={handleActionButtons.onJukebox}
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
          <Button onClick={activateAudioSystem} variant="secondary">
            🔊 Enable Sound & Music
          </Button>
          <Button onClick={exportTreasuryNotes} variant="outline">
            💾 Export Treasury Notes
          </Button>
        </div>

        <div className="mt-4 sm:mt-8">
          {activeTab === 'treasury' && (
            <>
              {userCoins.length === 0 ? (
                <Card className="p-6 sm:p-12 text-center bg-card border-2 border-border">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {userCoins.map((coin) => (
                    <TokenCard
                      key={coin.id}
                      coin={coin}
                      onTransfer={(coinId) => {
                        toast.info('Transfer feature coming soon!')
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'marketplace' && (
            <Marketplace
              userCoins={userCoins}
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
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Jukebox menu"
            className="fixed bottom-6 right-6 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-all cursor-pointer overflow-hidden z-50 animate-bounce"
            style={{
              background: 'linear-gradient(135deg, oklch(0.75 0.18 85) 0%, oklch(0.70 0.16 80) 100%)',
              borderRadius: '8px',
              boxShadow: '0 6px 0 oklch(0.55 0.14 75), 0 8px 20px oklch(0 0 0 / 0.3)',
              border: '3px solid oklch(0.85 0.20 85)',
            }}
          >
            <span className="text-3xl sm:text-4xl">☰</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>Jukebox</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowJukebox(true)}>
            🎧 Open Mario Jukebox
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open('https://pewpi-infinity.github.io/smug_look/mario-jukebox.html', '_blank', 'noopener,noreferrer')}>
            🔗 Open Classic Jukebox Page
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Toaster />
      
      <HomepageAIDesigner />
    </div>
  )
}

export default App
