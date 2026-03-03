import { useState, useEffect, useRef } from 'react'
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
}

export function GameEmulatorBuilder({ open, onClose }: GameEmulatorBuilderProps) {
  const [gameState, setGameState] = useState({
    marioX: 100,
    marioY: 300,
    velocityY: 0,
    isJumping: false,
    score: 0,
    coins: 0
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [keys, setKeys] = useState<Set<string>>(new Set())
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiMessages, setAIMessages] = useState<Array<{ type: 'user' | 'bot', content: string, timestamp: number }>>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isAITyping, setIsAITyping] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const archiveMarioUrl = 'https://archive.org/details/super-mario-bros_202007'

  const updateRemoteKey = (key: string, pressed: boolean) => {
    setKeys(prev => {
      const next = new Set(prev)
      if (pressed) {
        next.add(key)
      } else {
        next.delete(key)
      }
      return next
    })
  }

  useEffect(() => {
    setIsAndroid(/Android/i.test(window.navigator.userAgent))

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
    if (!isPlaying || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!

    const gameLoop = () => {
      setGameState(prev => {
        let { marioX, marioY, velocityY, isJumping, score, coins } = prev

        if (keys.has('ArrowLeft') || keys.has('a')) marioX -= 5
        if (keys.has('ArrowRight') || keys.has('d')) marioX += 5
        if ((keys.has('ArrowUp') || keys.has(' ') || keys.has('w')) && !isJumping) {
          velocityY = -15
          isJumping = true
        }

        velocityY += 0.8
        marioY += velocityY

        if (marioY >= 300) {
          marioY = 300
          velocityY = 0
          isJumping = false
        }

        marioX = Math.max(0, Math.min(750, marioX))

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
          const coinX = 150 + i * 150
          const coinY = 200 + Math.sin(Date.now() / 500 + i) * 20

          ctx.fillStyle = '#f1c40f'
          ctx.beginPath()
          ctx.arc(coinX, coinY, 15, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = '#e67e22'
          ctx.lineWidth = 3
          ctx.stroke()

          if (Math.abs(marioX - coinX) < 30 && Math.abs(marioY - coinY) < 30) {
            coins += 1
            score += 100
          }
        }

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 20px "Press Start 2P", monospace'
        ctx.fillText(`COINS: ${coins}`, 10, 30)
        ctx.fillText(`SCORE: ${score}`, 10, 60)

        return { marioX, marioY, velocityY, isJumping, score, coins }
      })

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, keys])

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
      coins: 0
    })
    setIsPlaying(false)
    toast.info('Game Reset!')
  }

  const handleLoadFromGitHub = () => {
    toast.info('Loading from GitHub...', {
      description: 'Connecting to pewpi-infinity/Mario-3 repository'
    })
    
    setTimeout(() => {
      toast.success('Mario preloaded from Internet Archive!', {
        description: 'Opening ready-to-play Mario archive source'
      })
      window.open(archiveMarioUrl, '_blank')
    }, 2000)
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
- Integrating with the pewpi-infinity/Mario-3 GitHub repository
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card border-4 border-[oklch(0.75_0.18_85)]">
        <DialogHeader>
          <DialogTitle className="text-2xl pixel-font flex items-center gap-2">
            <GameController size={28} weight="fill" className="text-[oklch(0.75_0.18_85)]" />
            MARIO GAME EMULATOR BUILDER
          </DialogTitle>
          <DialogDescription>
            Build and play Mario games • Powered by pewpi-infinity/Mario-3 repo
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2 space-y-4">
            <Card className="p-4 bg-gradient-to-br from-[oklch(0.58_0.24_330)] to-[oklch(0.70_0.24_190)] border-2 border-[oklch(0.75_0.18_85)]">
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
                Load from Mario-3 Repo
              </Button>
            </div>

            {isAndroid && (
              <Card className="p-4 bg-gradient-to-br from-[oklch(0.58_0.24_330)] to-[oklch(0.70_0.24_190)] border-2 border-[oklch(0.75_0.18_85)]">
                <h3 className="font-bold text-white mb-2 text-sm pixel-font text-center">ANDROID REMOTE</h3>
                <div className="grid grid-cols-3 gap-2 max-w-56 mx-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="col-start-2 border-white/60 text-white"
                    onTouchStart={() => updateRemoteKey('ArrowUp', true)}
                    onTouchEnd={() => updateRemoteKey('ArrowUp', false)}
                  >
                    <ArrowUp size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/60 text-white"
                    onTouchStart={() => updateRemoteKey('ArrowLeft', true)}
                    onTouchEnd={() => updateRemoteKey('ArrowLeft', false)}
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] text-[oklch(0.15_0.02_280)]"
                    onTouchStart={() => updateRemoteKey(' ', true)}
                    onTouchEnd={() => updateRemoteKey(' ', false)}
                  >
                    JUMP
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/60 text-white"
                    onTouchStart={() => updateRemoteKey('ArrowRight', true)}
                    onTouchEnd={() => updateRemoteKey('ArrowRight', false)}
                  >
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </Card>
            )}

            {!isAndroid && (
              <Card className="p-3 bg-[oklch(0.22_0.03_285)] border-2 border-[oklch(0.75_0.18_85)]">
                <p className="text-xs text-white/80 text-center">Remote controls are configured for Android devices only.</p>
              </Card>
            )}

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
                  <Label className="text-xs text-white">Repository</Label>
                  <Input
                    value="pewpi-infinity/Mario-3"
                    readOnly
                    className="mt-1 bg-[oklch(0.15_0.02_280)] text-white border-[oklch(0.75_0.18_85)]"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.75_0.15_155)]"
                  onClick={() => window.open('https://github.com/pewpi-infinity/Mario-3', '_blank')}
                >
                  <GithubLogo size={16} className="mr-2" />
                  View on GitHub
                </Button>
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
