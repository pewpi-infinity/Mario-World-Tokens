import { useState, useEffect, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GameController, Play, Pause, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, GithubLogo, Robot, PaperPlaneTilt, X } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface GameEmulatorBuilderProps {
  open: boolean
  onClose: () => void
  onCollectResearchToken?: (token: ResearchTokenDraft) => void
}

interface GitHubRepoResponse {
  full_name: string
  stargazers_count: number
}

interface NESGamePreset {
  id: string
  title: string
  repoFullName: string
  researchLinks: string[]
}

export interface ResearchTokenDraft {
  id: string
  title: string
  description: string
  gameTitle: string
  coinCount: number
  score: number
  researchLinks: string[]
  keywords: string[]
}

const NES_GAME_PRESETS: NESGamePreset[] = [
  {
    id: 'smb1',
    title: 'Super Mario Bros. (NES)',
    repoFullName: 'github/game-off-2023',
    researchLinks: ['https://en.wikipedia.org/wiki/Super_Mario_Bros.', 'https://www.nintendo.com/us/store/products/nintendo-entertainment-system-nintendo-switch-online-switch/']
  },
  {
    id: 'zelda1',
    title: 'The Legend of Zelda (NES)',
    repoFullName: 'openzelda/openzelda',
    researchLinks: ['https://en.wikipedia.org/wiki/The_Legend_of_Zelda_(video_game)', 'https://www.nintendo.com/us/store/products/nintendo-entertainment-system-nintendo-switch-online-switch/']
  },
  {
    id: 'metroid',
    title: 'Metroid (NES)',
    repoFullName: 'nesdoug/26_Metroidvania',
    researchLinks: ['https://en.wikipedia.org/wiki/Metroid_(video_game)', 'https://www.mobygames.com/game/1308/metroid/']
  }
]
const JUMP_KEY = ' '
const GRAVITY = 0.8
const DOWN_ACCELERATION = 1.2
const MAX_TOKEN_KEYWORDS = 6
const MAX_RESEARCH_FEED_SIZE = 8
const COIN_RESPAWN_DELAY_MS = 1200

function isGitHubRepoResponse(value: unknown): value is GitHubRepoResponse {
  return !!value
    && typeof value === 'object'
    && typeof (value as GitHubRepoResponse).full_name === 'string'
    && typeof (value as GitHubRepoResponse).stargazers_count === 'number'
}

export function GameEmulatorBuilder({ open, onClose, onCollectResearchToken }: GameEmulatorBuilderProps) {
  const [selectedGameId, setSelectedGameId] = useState(NES_GAME_PRESETS[0].id)
  const [gameState, setGameState] = useState({
    marioX: 100,
    marioY: 300,
    velocityY: 0,
    isJumping: false,
    score: 0,
    coins: 0,
    collectedCoinIndexes: [] as number[],
    coinWaveClearedAt: null as number | null
  })
  const [tokenWords, setTokenWords] = useState('hero, coin, retro')
  const [researchFeed, setResearchFeed] = useState<ResearchTokenDraft[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [keys, setKeys] = useState<Set<string>>(new Set())
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiMessages, setAIMessages] = useState<Array<{ type: 'user' | 'bot', content: string, timestamp: number }>>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isAITyping, setIsAITyping] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const previousCoinCountRef = useRef(0)
  const selectedGame = NES_GAME_PRESETS.find(game => game.id === selectedGameId) ?? NES_GAME_PRESETS[0]
  const setVirtualKey = useCallback((key: string, isPressed: boolean) => {
    setKeys(prev => {
      const alreadyPressed = prev.has(key)
      if (isPressed === alreadyPressed) return prev
      const newKeys = new Set(prev)
      if (isPressed) {
        newKeys.add(key)
      } else {
        newKeys.delete(key)
      }
      return newKeys
    })
  }, [])
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, marioX: number, marioY: number, coins: number, score: number, collectedCoinIndexes: number[]) => {
    ctx.fillStyle = '#5dade2'
    ctx.fillRect(0, 0, 800, 400)

    ctx.fillStyle = '#27ae60'
    ctx.fillRect(0, 350, 800, 50)

    ctx.fillStyle = '#c0392b'
    ctx.fillRect(marioX, marioY, 40, 50)

    ctx.fillStyle = '#f1c40f'
    ctx.beginPath()
    ctx.arc(marioX + 20, marioY - 10, 15, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#e67e22'
    ctx.fillRect(marioX + 10, marioY + 20, 20, 15)

    for (let i = 0; i < 5; i++) {
      if (collectedCoinIndexes.includes(i)) continue
      const coinX = 150 + i * 150
      const coinY = 200 + Math.sin(Date.now() / 500 + i) * 20

      ctx.fillStyle = '#f1c40f'
      ctx.beginPath()
      ctx.arc(coinX, coinY, 15, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#e67e22'
      ctx.lineWidth = 3
      ctx.stroke()
    }

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 20px "Press Start 2P", monospace'
    ctx.fillText(`COINS: ${coins}`, 10, 30)
    ctx.fillText(`SCORE: ${score}`, 10, 60)
    ctx.fillText(`GAME: ${selectedGame.title}`, 10, 90)
  }, [selectedGame.title])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev)
        newKeys.delete(e.key)
        return newKeys
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!isPlaying) return

    const gameLoop = () => {
      setGameState(prev => {
        let { marioX, marioY, velocityY, isJumping, score, coins, collectedCoinIndexes, coinWaveClearedAt } = prev

        if (keys.has('ArrowLeft') || keys.has('a')) marioX -= 5
        if (keys.has('ArrowRight') || keys.has('d')) marioX += 5
        if ((keys.has('ArrowUp') || keys.has(JUMP_KEY) || keys.has('w')) && !isJumping) {
          velocityY = -15
          isJumping = true
        }

        velocityY += GRAVITY
        if (keys.has('ArrowDown')) velocityY += DOWN_ACCELERATION
        marioY += velocityY

        if (marioY >= 300) {
          marioY = 300
          velocityY = 0
          isJumping = false
        }

        marioX = Math.max(0, Math.min(750, marioX))

        if (coinWaveClearedAt !== null && Date.now() - coinWaveClearedAt >= COIN_RESPAWN_DELAY_MS) {
          collectedCoinIndexes = []
          coinWaveClearedAt = null
        }

        for (let i = 0; i < 5; i++) {
          if (collectedCoinIndexes.includes(i)) continue
          const coinX = 150 + i * 150
          const coinY = 200 + Math.sin(Date.now() / 500 + i) * 20
          if (Math.abs(marioX - coinX) < 30 && Math.abs(marioY - coinY) < 30) {
            coins += 1
            score += 100
            collectedCoinIndexes = [...collectedCoinIndexes, i]
          }
        }

        if (collectedCoinIndexes.length >= 5) {
          coinWaveClearedAt = coinWaveClearedAt ?? Date.now()
        }

        drawFrame(ctx, marioX, marioY, coins, score, collectedCoinIndexes)

        return { marioX, marioY, velocityY, isJumping, score, coins, collectedCoinIndexes, coinWaveClearedAt }
      })

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, keys, drawFrame])

  useEffect(() => {
    if (!open || isPlaying || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    drawFrame(ctx, gameState.marioX, gameState.marioY, gameState.coins, gameState.score, gameState.collectedCoinIndexes)
  }, [open, isPlaying, gameState, drawFrame])

  useEffect(() => {
    if (gameState.coins <= previousCoinCountRef.current) return

    const keywords = tokenWords
      .split(',')
      .map(word => word.trim())
      .filter(Boolean)
      .slice(0, MAX_TOKEN_KEYWORDS)

    const token: ResearchTokenDraft = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: `${selectedGame.title} Coin #${gameState.coins}${keywords[0] ? ` • ${keywords[0]}` : ''}`,
      description: `AI research token generated from ${selectedGame.title} gameplay.`,
      gameTitle: selectedGame.title,
      coinCount: gameState.coins,
      score: gameState.score,
      researchLinks: selectedGame.researchLinks,
      keywords
    }

    setResearchFeed((prev) => [token, ...prev].slice(0, MAX_RESEARCH_FEED_SIZE))
    onCollectResearchToken?.(token)
    previousCoinCountRef.current = gameState.coins
    toast.success('🪙 Research token generated', {
      description: `${selectedGame.title} • Coin ${gameState.coins}`
    })
  }, [gameState.coins, gameState.score, onCollectResearchToken, selectedGame, tokenWords])

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      toast.success('🎮 Game Started!')
    }
  }

  const handleReset = () => {
    setGameState({
      marioX: 100,
      marioY: 300,
      velocityY: 0,
      isJumping: false,
      score: 0,
      coins: 0,
      collectedCoinIndexes: [],
      coinWaveClearedAt: null
    })
    setResearchFeed([])
    previousCoinCountRef.current = 0
    setIsPlaying(false)
    toast.info('Game Reset!')
  }

  const handleLoadFromGitHub = () => {
    toast.info('Loading from GitHub...', {
      description: `Connecting to ${selectedGame.repoFullName} repository`
    })

    fetch(`https://api.github.com/repos/${selectedGame.repoFullName}`)
      .then((response) => {
        if (!response.ok) {
          const remainingHeader = response.headers.get('X-RateLimit-Remaining')
          const remainingRateLimit = remainingHeader === null ? null : Number(remainingHeader)
          if (response.status === 403 && remainingRateLimit !== null && remainingRateLimit <= 0) {
            throw new Error('GitHub API rate limit exceeded. Please try again later.')
          }
          throw new Error(`GitHub API returned ${response.status}`)
        }
        return response.json() as Promise<unknown>
      })
      .then((repo) => {
        if (!isGitHubRepoResponse(repo)) {
          throw new Error('GitHub API returned unexpected repository data')
        }

        toast.success('GitHub Integration Ready!', {
          description: `${repo.full_name} loaded • ⭐ ${repo.stargazers_count}`
        })
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unable to load repository data'
        toast.error('GitHub integration failed', { description: message })
      })
  }

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [aiMessages])

  const handleSendAIMessage = async () => {
    if (!currentMessage.trim() || isAITyping) return

    const userMsg = {
      type: 'user' as const,
      content: currentMessage.trim(),
      timestamp: Date.now()
    }

    setAIMessages(prev => [...prev, userMsg])
    setCurrentMessage('')
    setIsAITyping(true)

    try {
      const prompt = (window as any).spark.llmPrompt`You are the Game AI Bot for the Mario Game Emulator Builder system.
You help users with:
- Building custom Mario games and emulators
- Understanding game mechanics and physics
- Creating new levels and sprites
- Integrating with the ${selectedGame.repoFullName} GitHub repository
- Designing game features and power-ups
- Optimizing game performance

User question: ${userMsg.content}

Current game stats:
- Mario Position: X=${gameState.marioX}, Y=${gameState.marioY}
- Coins Collected: ${gameState.coins}
- Score: ${gameState.score}
- Is Playing: ${isPlaying}

Provide helpful, specific guidance related to game building, emulators, and Mario game mechanics. Be conversational and educational.`

      const response = await (window as any).spark.llm(prompt, 'gpt-4o-mini')

      const botMsg = {
        type: 'bot' as const,
        content: response,
        timestamp: Date.now()
      }

      setAIMessages(prev => [...prev, botMsg])
      toast.success('Game AI responded!')
    } catch (error) {
      toast.error('AI response failed')
      console.error(error)
    } finally {
      setIsAITyping(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl pixel-font flex items-center gap-2">
            <GameController size={28} weight="fill" className="text-[oklch(0.75_0.18_85)]" />
            MARIO GAME EMULATOR BUILDER
          </DialogTitle>
          <DialogDescription>
            Build and play real NES-inspired games and mint research tokens from collected coins
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2 space-y-4">
            <Card className="p-4 bg-[oklch(0.15_0.02_280)] border-2 border-[oklch(0.75_0.18_85)]">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full bg-[oklch(0.3_0.05_240)] rounded-lg"
              />
            </Card>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleTogglePlay}
                className="bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.85_0.20_85)] text-[oklch(0.15_0.02_280)]"
              >
                {isPlaying ? (
                  <>
                    <Pause size={20} weight="fill" className="mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} weight="fill" className="mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-[oklch(0.75_0.18_85)]"
              >
                Reset
              </Button>
              <Button
                onClick={handleLoadFromGitHub}
                variant="outline"
                className="border-[oklch(0.65_0.15_155)]"
              >
                <GithubLogo size={20} weight="fill" className="mr-2" />
                Load Selected Repo
              </Button>
            </div>

            <Card className="p-4 bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.15_0.02_280)] border-2 border-[oklch(0.75_0.18_85)]">
              <h3 className="font-bold text-[oklch(0.75_0.18_85)] mb-2 text-sm pixel-font">CONTROLS</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-white">
                <div className="flex items-center gap-2">
                  <div className="bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] px-2 py-1 rounded font-mono">←→</div>
                  <span>or A/D - Move Left/Right</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] px-2 py-1 rounded font-mono">↑</div>
                  <span>or W/SPACE - Jump</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] px-2 py-1 rounded font-mono">↓</div>
                  <span>Fast Fall</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-[oklch(0.75_0.18_85)] mb-2 font-semibold">ANDROID JOYSTICK</p>
                <div className="flex items-center justify-between gap-4">
                  <div className="grid grid-cols-3 gap-2 w-fit">
                    <div />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 border-[oklch(0.75_0.18_85)] bg-[oklch(0.18_0.02_280)] text-white touch-none"
                      onTouchStart={(e) => { e.preventDefault(); setVirtualKey('ArrowUp', true) }}
                      onTouchEnd={() => setVirtualKey('ArrowUp', false)}
                      onMouseDown={() => setVirtualKey('ArrowUp', true)}
                      onMouseUp={() => setVirtualKey('ArrowUp', false)}
                      onMouseLeave={() => setVirtualKey('ArrowUp', false)}
                    >
                      <ArrowUp size={18} weight="bold" />
                    </Button>
                    <div />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 border-[oklch(0.75_0.18_85)] bg-[oklch(0.18_0.02_280)] text-white touch-none"
                      onTouchStart={(e) => { e.preventDefault(); setVirtualKey('ArrowLeft', true) }}
                      onTouchEnd={() => setVirtualKey('ArrowLeft', false)}
                      onMouseDown={() => setVirtualKey('ArrowLeft', true)}
                      onMouseUp={() => setVirtualKey('ArrowLeft', false)}
                      onMouseLeave={() => setVirtualKey('ArrowLeft', false)}
                    >
                      <ArrowLeft size={18} weight="bold" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 border-[oklch(0.75_0.18_85)] bg-[oklch(0.18_0.02_280)] text-white touch-none"
                      onTouchStart={(e) => { e.preventDefault(); setVirtualKey('ArrowDown', true) }}
                      onTouchEnd={() => setVirtualKey('ArrowDown', false)}
                      onMouseDown={() => setVirtualKey('ArrowDown', true)}
                      onMouseUp={() => setVirtualKey('ArrowDown', false)}
                      onMouseLeave={() => setVirtualKey('ArrowDown', false)}
                    >
                      <ArrowDown size={18} weight="bold" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 border-[oklch(0.75_0.18_85)] bg-[oklch(0.18_0.02_280)] text-white touch-none"
                      onTouchStart={(e) => { e.preventDefault(); setVirtualKey('ArrowRight', true) }}
                      onTouchEnd={() => setVirtualKey('ArrowRight', false)}
                      onMouseDown={() => setVirtualKey('ArrowRight', true)}
                      onMouseUp={() => setVirtualKey('ArrowRight', false)}
                      onMouseLeave={() => setVirtualKey('ArrowRight', false)}
                    >
                      <ArrowRight size={18} weight="bold" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="h-14 px-5 border-[oklch(0.75_0.18_85)] bg-[oklch(0.18_0.02_280)] text-white touch-none"
                    onTouchStart={(e) => { e.preventDefault(); setVirtualKey(JUMP_KEY, true) }}
                    onTouchEnd={() => setVirtualKey(JUMP_KEY, false)}
                    onMouseDown={() => setVirtualKey(JUMP_KEY, true)}
                    onMouseUp={() => setVirtualKey(JUMP_KEY, false)}
                    onMouseLeave={() => setVirtualKey(JUMP_KEY, false)}
                  >
                    JUMP
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-br from-[oklch(0.70_0.24_190)] to-[oklch(0.58_0.24_330)] border-2 border-[oklch(0.75_0.18_85)]">
              <h3 className="font-bold text-white mb-3 text-sm pixel-font">GAME STATS</h3>
              <div className="space-y-2 text-white">
                <div className="flex justify-between items-center p-2 bg-black/20 rounded">
                  <span className="text-sm">🪙 Coins:</span>
                  <span className="text-xl font-bold text-[oklch(0.75_0.18_85)]">{gameState.coins}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black/20 rounded">
                  <span className="text-sm">⭐ Score:</span>
                  <span className="text-xl font-bold text-[oklch(0.75_0.18_85)]">{gameState.score}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black/20 rounded">
                  <span className="text-sm">Position:</span>
                  <span className="text-xs font-mono">X: {Math.floor(gameState.marioX)}, Y: {Math.floor(gameState.marioY)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-[oklch(0.22_0.03_285)] border-2 border-[oklch(0.75_0.18_85)]">
              <h3 className="font-bold text-[oklch(0.75_0.18_85)] mb-3 text-sm pixel-font">GITHUB INTEGRATION</h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-white">Real NES Game</Label>
                  <select
                    value={selectedGameId}
                    onChange={(event) => setSelectedGameId(event.target.value)}
                    className="mt-1 w-full h-9 rounded-md border border-[oklch(0.75_0.18_85)] bg-[oklch(0.15_0.02_280)] px-3 text-sm text-white"
                  >
                    {NES_GAME_PRESETS.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-white">Token words (comma-separated)</Label>
                  <Input
                    value={tokenWords}
                    onChange={(event) => setTokenWords(event.target.value)}
                    className="mt-1 bg-[oklch(0.15_0.02_280)] text-white border-[oklch(0.75_0.18_85)]"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.75_0.15_155)]"
                  onClick={() => window.open(`https://github.com/${selectedGame.repoFullName}`, '_blank')}
                >
                  <GithubLogo size={16} className="mr-2" />
                  View on GitHub
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-[oklch(0.22_0.03_285)] border-2 border-[oklch(0.75_0.18_85)]">
              <h3 className="font-bold text-[oklch(0.75_0.18_85)] mb-2 text-sm pixel-font">RESEARCH TOKENS</h3>
              <div className="space-y-2 text-xs">
                {researchFeed.length === 0 ? (
                  <p className="text-[oklch(0.85_0.02_280)]">Collect coins to generate token titles and research links.</p>
                ) : researchFeed.map((token) => (
                  <div key={token.id} className="rounded border border-[oklch(0.35_0.05_285)] p-2 text-white">
                    <p className="font-semibold">{token.title}</p>
                    <p className="text-[oklch(0.85_0.02_280)]">{token.description}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {token.keywords.map((word) => (
                        <span key={word} className="rounded bg-[oklch(0.75_0.18_85)] px-1 text-[oklch(0.15_0.02_280)]">{word}</span>
                      ))}
                    </div>
                    <div className="mt-1 space-y-1">
                      {token.researchLinks.map((link) => (
                        <button
                          key={link}
                          type="button"
                          onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                          className="block text-left text-[oklch(0.75_0.18_85)] underline"
                        >
                          {link}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-[oklch(0.22_0.03_285)] border-2 border-[oklch(0.75_0.18_85)]">
              <h3 className="font-bold text-[oklch(0.75_0.18_85)] mb-2 text-sm pixel-font">GAME BUILDER</h3>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start text-xs border-[oklch(0.75_0.18_85)] text-white"
                  onClick={() => toast.info('Level Editor coming soon!')}
                >
                  🗺️ Level Editor
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start text-xs border-[oklch(0.75_0.18_85)] text-white"
                  onClick={() => toast.info('Sprite Creator coming soon!')}
                >
                  🎨 Sprite Creator
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start text-xs border-[oklch(0.75_0.18_85)] text-white"
                  onClick={() => toast.info('Physics Engine coming soon!')}
                >
                  ⚙️ Physics Engine
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start text-xs border-[oklch(0.75_0.18_85)] text-white"
                  onClick={() => toast.info('Sound Editor coming soon!')}
                >
                  🎵 Sound Editor
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-[oklch(0.22_0.03_285)] border-2 border-[oklch(0.75_0.18_85)]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-[oklch(0.75_0.18_85)] text-sm pixel-font flex items-center gap-2">
                  <Robot weight="fill" />
                  GAME AI
                </h3>
                <Button
                  size="sm"
                  variant={showAIChat ? "destructive" : "outline"}
                  onClick={() => setShowAIChat(!showAIChat)}
                  className="text-xs h-6"
                >
                  {showAIChat ? <><X size={12} /> Close</> : <><Robot size={12} weight="fill" /> Chat</>}
                </Button>
              </div>

              {showAIChat && (
                <div className="space-y-2">
                  <ScrollArea className="h-48 bg-[oklch(0.18_0.02_280)] rounded p-2" ref={chatScrollRef}>
                    {aiMessages.length === 0 ? (
                      <div className="text-center text-[oklch(0.65_0.02_280)] py-6 text-xs">
                        <Robot size={24} weight="fill" className="mx-auto mb-2 opacity-50" />
                        <p>Ask me about game development!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {aiMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded p-2 text-xs ${
                                msg.type === 'user'
                                  ? 'bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)]'
                                  : 'bg-[oklch(0.25_0.03_285)] text-white'
                              }`}
                            >
                              {msg.type === 'bot' && (
                                <div className="flex items-start gap-1">
                                  <Robot size={12} weight="fill" className="mt-0.5 flex-shrink-0" />
                                  <div className="whitespace-pre-wrap text-[10px] leading-relaxed">{msg.content}</div>
                                </div>
                              )}
                              {msg.type === 'user' && msg.content}
                            </div>
                          </div>
                        ))}
                        {isAITyping && (
                          <div className="flex justify-start">
                            <div className="bg-[oklch(0.25_0.03_285)] rounded p-2 flex items-center gap-1">
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="flex gap-1">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendAIMessage()
                        }
                      }}
                      placeholder="Ask about game features..."
                      className="flex-1 bg-[oklch(0.15_0.02_280)] border-[oklch(0.35_0.05_285)] text-white text-xs h-8"
                      disabled={isAITyping}
                    />
                    <Button
                      onClick={handleSendAIMessage}
                      disabled={!currentMessage.trim() || isAITyping}
                      className="bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] text-[oklch(0.15_0.02_280)] h-8 px-2"
                      size="sm"
                    >
                      <PaperPlaneTilt weight="fill" size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
