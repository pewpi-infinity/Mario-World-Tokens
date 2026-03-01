import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ScienceLaboratory } from '@/components/ScienceLaboratory'
import { toast } from 'sonner'
import { Robot, PaperPlaneTilt, X, Lightning, Rocket, Star, Fire, Gauge, Timer } from '@phosphor-icons/react'

interface MarioRaceTrackProps {
  open: boolean
  onClose: () => void
}

interface Racer {
  id: string
  name: string
  emoji: string
  position: number
  lap: number
  speed: number
  velocity: number
  acceleration: number
  mass: number
  friction: number
  drag: number
  powerup: string | null
  boostActive: boolean
  boostCooldown: number
  totalForce: number
  kineticEnergy: number
}

interface RaceResult {
  timestamp: number
  position: number
  lapTime: number
  sciencePointsEarned: number
  avgVelocity: number
  maxVelocity: number
  totalDistance: number
}

interface PhysicsSnapshot {
  time: number
  velocity: number
  acceleration: number
  force: number
  kineticEnergy: number
}

export function MarioRaceTrack({ open, onClose }: MarioRaceTrackProps) {
  const [raceResults, setRaceResults] = useKV<RaceResult[]>('race-results', [])
  const [sciencePoints, setSciencePoints] = useKV<number>('science-points', 0)
  const [isRacing, setIsRacing] = useState(false)
  const [raceTime, setRaceTime] = useState(0)
  const [showLab, setShowLab] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiMessages, setAIMessages] = useState<Array<{ type: 'user' | 'bot', content: string, timestamp: number }>>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isAITyping, setIsAITyping] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  const [touchAccel, setTouchAccel] = useState(0)
  const [showPhysicsGraph, setShowPhysicsGraph] = useState(false)
  const [physicsData, setPhysicsData] = useState<PhysicsSnapshot[]>([])
  
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const [racers, setRacers] = useState<Racer[]>([
    { 
      id: 'player', 
      name: 'You (Mario)', 
      emoji: '🏎️', 
      position: 0, 
      lap: 0, 
      speed: 0, 
      velocity: 0, 
      acceleration: 0, 
      mass: 100, 
      friction: 0.95, 
      drag: 0.02,
      powerup: null, 
      boostActive: false, 
      boostCooldown: 0,
      totalForce: 0,
      kineticEnergy: 0
    },
    { 
      id: 'luigi', 
      name: 'Luigi', 
      emoji: '🏁', 
      position: 0, 
      lap: 0, 
      speed: 0, 
      velocity: 0, 
      acceleration: 0, 
      mass: 95, 
      friction: 0.96, 
      drag: 0.018,
      powerup: null, 
      boostActive: false, 
      boostCooldown: 0,
      totalForce: 0,
      kineticEnergy: 0
    },
    { 
      id: 'peach', 
      name: 'Peach', 
      emoji: '👑', 
      position: 0, 
      lap: 0, 
      speed: 0, 
      velocity: 0, 
      acceleration: 0, 
      mass: 90, 
      friction: 0.97, 
      drag: 0.015,
      powerup: null, 
      boostActive: false, 
      boostCooldown: 0,
      totalForce: 0,
      kineticEnergy: 0
    },
    { 
      id: 'bowser', 
      name: 'Bowser', 
      emoji: '🐢', 
      position: 0, 
      lap: 0, 
      speed: 0, 
      velocity: 0, 
      acceleration: 0, 
      mass: 120, 
      friction: 0.93, 
      drag: 0.025,
      powerup: null, 
      boostActive: false, 
      boostCooldown: 0,
      totalForce: 0,
      kineticEnergy: 0
    }
  ])

  const raceIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const physicsLogRef = useRef<NodeJS.Timeout | null>(null)

  const maxLaps = 3
  const trackLength = 100

  useEffect(() => {
    if (isRacing) {
      timerRef.current = setInterval(() => {
        setRaceTime(prev => prev + 0.1)
      }, 100)
      
      physicsLogRef.current = setInterval(() => {
        setPhysicsData(prev => {
          const player = racers[0]
          const newSnapshot: PhysicsSnapshot = {
            time: raceTime,
            velocity: player.velocity,
            acceleration: player.acceleration,
            force: player.totalForce,
            kineticEnergy: player.kineticEnergy
          }
          return [...prev.slice(-50), newSnapshot]
        })
      }, 200)
      
      raceIntervalRef.current = setInterval(() => {
        setRacers(prevRacers => {
          return prevRacers.map(racer => {
            let acc = racer.acceleration
            
            if (racer.id !== 'player') {
              acc = (Math.random() - 0.35) * 2.5
              
              if (Math.random() < 0.01) {
                return { ...racer, boostActive: true, boostCooldown: 20 }
              }
            }
            
            const boostMultiplier = racer.boostActive ? 2.5 : 1
            const effectiveAcc = acc * boostMultiplier
            
            const force = effectiveAcc * racer.mass
            const dragForce = racer.drag * racer.velocity * racer.velocity
            const netForce = force - dragForce
            
            const newVelocity = (racer.velocity + netForce / racer.mass) * racer.friction
            const clampedVelocity = Math.max(-6, Math.min(12, newVelocity))
            
            const kineticEnergy = 0.5 * racer.mass * clampedVelocity * clampedVelocity
            
            const newPosition = racer.position + clampedVelocity
            const newLap = racer.lap + Math.floor(newPosition / trackLength)
            const finalPosition = newPosition % trackLength

            if (newLap >= maxLaps && racer.lap < maxLaps) {
              if (racer.id === 'player') {
                const racerPositions = prevRacers
                  .map((r, idx) => ({ ...r, originalIdx: idx }))
                  .sort((a, b) => {
                    if (a.lap !== b.lap) return b.lap - a.lap
                    return b.position - a.position
                  })
                const playerPos = racerPositions.findIndex(r => r.id === 'player') + 1
                finishRace(playerPos, raceTime)
              }
            }

            const newBoostCooldown = racer.boostCooldown > 0 ? racer.boostCooldown - 1 : 0
            const newBoostActive = racer.boostActive && newBoostCooldown > 0

            return {
              ...racer,
              position: finalPosition < 0 ? trackLength + finalPosition : finalPosition,
              lap: Math.min(newLap, maxLaps),
              velocity: clampedVelocity,
              acceleration: racer.id === 'player' ? racer.acceleration : 0,
              speed: Math.abs(clampedVelocity),
              boostActive: newBoostActive,
              boostCooldown: newBoostCooldown,
              totalForce: netForce,
              kineticEnergy
            }
          })
        })
      }, 100)
    } else {
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
      if (physicsLogRef.current) clearInterval(physicsLogRef.current)
    }

    return () => {
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
      if (physicsLogRef.current) clearInterval(physicsLogRef.current)
    }
  }, [isRacing, raceTime, racers])

  const startRace = () => {
    setRacers(prevRacers => prevRacers.map(r => ({ 
      ...r, 
      position: 0, 
      lap: 0, 
      speed: 0, 
      velocity: 0, 
      acceleration: 0, 
      powerup: null,
      boostActive: false,
      boostCooldown: 0,
      totalForce: 0,
      kineticEnergy: 0
    })))
    setRaceTime(0)
    setPhysicsData([])
    setIsRacing(true)
    toast.success('🏁 Race Started! Use controls to accelerate!')
  }

  const finishRace = (position: number, time: number) => {
    setIsRacing(false)
    const pointsEarned = Math.max(150 - position * 30, 20)
    
    const playerVelocities = physicsData.map(p => p.velocity)
    const avgVelocity = playerVelocities.length > 0 
      ? playerVelocities.reduce((a, b) => a + b, 0) / playerVelocities.length 
      : 0
    const maxVelocity = playerVelocities.length > 0 
      ? Math.max(...playerVelocities) 
      : 0
    
    setSciencePoints((current) => (current || 0) + pointsEarned)
    setRaceResults((current) => [
      ...(current || []),
      {
        timestamp: Date.now(),
        position,
        lapTime: time,
        sciencePointsEarned: pointsEarned,
        avgVelocity,
        maxVelocity,
        totalDistance: maxLaps * trackLength
      }
    ])
    
    toast.success(`🏆 Finished ${position}${getOrdinalSuffix(position)}! +${pointsEarned} Science Points!`, {
      description: `Avg Speed: ${avgVelocity.toFixed(1)} m/s | Max: ${maxVelocity.toFixed(1)} m/s`
    })
    setTimeout(() => setShowPhysicsGraph(true), 500)
    setTimeout(() => setShowLab(true), 2000)
  }

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  const activateBoost = () => {
    const player = racers[0]
    if (!isRacing || player.boostCooldown > 0) return
    
    setRacers(prev => prev.map(r => 
      r.id === 'player' 
        ? { ...r, boostActive: true, boostCooldown: 30 }
        : r
    ))
    toast.success('🚀 BOOST ACTIVATED! Physics: F = ma × 2.5!')
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRacing || !open) return
      
      setRacers(prev => prev.map(r => {
        if (r.id !== 'player') return r
        
        let newAcc = r.acceleration
        
        if (e.key === 'ArrowUp') {
          newAcc = 2.0
        } else if (e.key === 'ArrowDown') {
          newAcc = -1.5
        } else if (e.key === ' ') {
          e.preventDefault()
          activateBoost()
          return r
        }
        
        return { ...r, acceleration: newAcc }
      }))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isRacing || !open) return
      
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        setRacers(prev => prev.map(r => 
          r.id === 'player' ? { ...r, acceleration: 0 } : r
        ))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isRacing, open])

  const handleTouchStart = (direction: 'up' | 'down') => {
    if (!isRacing) return
    setIsTouching(true)
    const accel = direction === 'up' ? 2.0 : -1.5
    setTouchAccel(accel)
    setRacers(prev => prev.map(r => 
      r.id === 'player' ? { ...r, acceleration: accel } : r
    ))
  }

  const handleTouchEnd = () => {
    setIsTouching(false)
    setTouchAccel(0)
    setRacers(prev => prev.map(r => 
      r.id === 'player' ? { ...r, acceleration: 0 } : r
    ))
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
      const player = racers[0]
      const recentPhysics = physicsData.slice(-10)
      
      const prompt = (window as any).spark.llmPrompt`You are the Movement AI Bot, an expert physics educator specializing in racing mechanics and real-world physics.

User question: ${userMsg.content}

Current race physics:
- Player mass: ${player.mass} kg
- Current velocity: ${player.velocity.toFixed(2)} m/s
- Current acceleration: ${player.acceleration.toFixed(2)} m/s²
- Friction coefficient: ${player.friction}
- Drag coefficient: ${player.drag}
- Kinetic energy: ${player.kineticEnergy.toFixed(2)} J
- Net force: ${player.totalForce.toFixed(2)} N
${recentPhysics.length > 0 ? `- Recent avg velocity: ${(recentPhysics.reduce((a, b) => a + b.velocity, 0) / recentPhysics.length).toFixed(2)} m/s` : ''}

Help the user understand:
- Real physics equations (F=ma, KE=½mv², drag force, friction)
- How their button presses affect force and acceleration
- How mass affects acceleration and top speed
- Energy transfer and conservation
- Optimizing racing strategy using physics

Be educational, conversational, and relate physics concepts to the actual race mechanics.`

      const response = await (window as any).spark.llm(prompt, 'gpt-4o-mini')

      const botMsg = {
        type: 'bot' as const,
        content: response,
        timestamp: Date.now()
      }

      setAIMessages(prev => [...prev, botMsg])
      toast.success('Movement AI responded!')
    } catch (error) {
      toast.error('AI response failed')
      console.error(error)
    } finally {
      setIsAITyping(false)
    }
  }

  const sortedRacers = [...racers].sort((a, b) => {
    if (a.lap !== b.lap) return b.lap - a.lap
    return b.position - a.position
  })

  const player = racers[0]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.18_0.02_290)] border-2 border-[oklch(0.75_0.18_85)] p-0">
        <div className="sticky top-0 z-20 bg-gradient-to-r from-[oklch(0.58_0.24_330)] via-[oklch(0.65_0.25_265)] to-[oklch(0.70_0.24_190)] px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-[oklch(0.75_0.18_85)]">
          <DialogTitle className="text-xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3 pixel-font">
            🏁 MARIO KART PHYSICS
          </DialogTitle>
        </div>

        <ScrollArea className="flex-1 px-3 sm:px-6 py-4">
          {!showLab ? (
            <div className="space-y-4 sm:space-y-6 pb-6">
              <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div>
                      <div className="text-2xl sm:text-4xl font-bold text-[oklch(0.75_0.18_85)] pixel-font">
                        {raceTime.toFixed(1)}s
                      </div>
                      <div className="text-xs sm:text-sm text-[oklch(0.65_0.02_280)]">
                        {racers[0].lap}/{maxLaps} Laps
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-[oklch(0.65_0.15_155)]">
                        🔬 {sciencePoints || 0}
                      </div>
                      <div className="text-xs text-[oklch(0.65_0.02_280)]">
                        Science Points
                      </div>
                    </div>
                  </div>

                  {!isRacing && (
                    <Button
                      onClick={startRace}
                      className="w-full bg-[oklch(0.58_0.24_330)] hover:bg-[oklch(0.63_0.26_330)] text-white text-base sm:text-xl py-6 sm:py-8 pixel-font"
                    >
                      🏁 START RACE!
                    </Button>
                  )}

                  {isRacing && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onTouchStart={() => handleTouchStart('up')}
                          onTouchEnd={handleTouchEnd}
                          onMouseDown={() => handleTouchStart('up')}
                          onMouseUp={handleTouchEnd}
                          onMouseLeave={handleTouchEnd}
                          className="h-16 sm:h-20 bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.70_0.17_155)] text-white text-lg sm:text-2xl font-bold active:scale-95 transition-transform"
                        >
                          ⬆️ GAS
                        </Button>
                        <Button
                          onTouchStart={() => handleTouchStart('down')}
                          onTouchEnd={handleTouchEnd}
                          onMouseDown={() => handleTouchStart('down')}
                          onMouseUp={handleTouchEnd}
                          onMouseLeave={handleTouchEnd}
                          className="h-16 sm:h-20 bg-[oklch(0.58_0.24_330)] hover:bg-[oklch(0.63_0.26_330)] text-white text-lg sm:text-2xl font-bold active:scale-95 transition-transform"
                        >
                          ⬇️ BRAKE
                        </Button>
                      </div>
                      
                      <Button
                        onClick={activateBoost}
                        disabled={player.boostCooldown > 0}
                        className="w-full h-14 sm:h-16 bg-gradient-to-r from-[oklch(0.75_0.18_85)] to-[oklch(0.70_0.24_190)] hover:from-[oklch(0.80_0.20_85)] hover:to-[oklch(0.75_0.26_190)] text-[oklch(0.15_0.02_280)] text-lg sm:text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {player.boostCooldown > 0 
                          ? `🚀 BOOST (${(player.boostCooldown / 10).toFixed(1)}s)` 
                          : player.boostActive 
                            ? '🚀 BOOSTING!' 
                            : '🚀 BOOST [SPACE]'
                        }
                      </Button>

                      <div className="bg-[oklch(0.18_0.02_280)] p-3 sm:p-4 rounded-lg space-y-2">
                        <h4 className="font-bold text-[oklch(0.75_0.18_85)] text-xs sm:text-sm mb-2 flex items-center gap-2">
                          <Gauge weight="fill" size={16} />
                          REAL-TIME PHYSICS
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span className="text-[oklch(0.65_0.02_280)]">Velocity:</span>
                            <span className="text-white font-bold">{player.velocity.toFixed(2)} m/s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[oklch(0.65_0.02_280)]">Accel:</span>
                            <span className="text-white font-bold">{player.acceleration.toFixed(2)} m/s²</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[oklch(0.65_0.02_280)]">Force:</span>
                            <span className="text-white font-bold">{player.totalForce.toFixed(1)} N</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[oklch(0.65_0.02_280)]">KE:</span>
                            <span className="text-white font-bold">{player.kineticEnergy.toFixed(0)} J</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[oklch(0.65_0.02_280)]">Mass:</span>
                            <span className="text-white font-bold">{player.mass} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[oklch(0.65_0.02_280)]">Friction:</span>
                            <span className="text-white font-bold">{(player.friction * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="text-xs text-[oklch(0.70_0.24_190)]">
                          💡 F = ma | KE = ½mv² | Drag = kv²
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
                <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-[oklch(0.75_0.18_85)] mb-4">Race Track</h3>
                  {sortedRacers.map((racer, index) => (
                    <div key={racer.id} className="space-y-2">
                      <div className="flex justify-between items-center text-xs sm:text-base">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs sm:text-sm ${
                            index === 0 ? 'bg-[oklch(0.75_0.18_85)]' :
                            index === 1 ? 'bg-[oklch(0.70_0.18_220)]' :
                            index === 2 ? 'bg-[oklch(0.65_0.15_30)]' :
                            'bg-[oklch(0.35_0.05_285)]'
                          } text-white font-bold`}>
                            {index + 1}
                          </Badge>
                          <span className="text-white font-bold">
                            {racer.emoji} {racer.name}
                          </span>
                          {racer.id === 'player' && (
                            <Badge className="bg-[oklch(0.65_0.15_155)] text-white text-xs">YOU</Badge>
                          )}
                          {racer.boostActive && (
                            <span className="text-lg">🚀</span>
                          )}
                        </div>
                        <div className="text-[oklch(0.75_0.18_85)] font-bold text-xs sm:text-sm">
                          {racer.lap}/{maxLaps}
                        </div>
                      </div>
                      <div className="relative bg-[oklch(0.12_0.01_280)] rounded-full h-6 sm:h-8 border-2 border-[oklch(0.35_0.05_285)]">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-200 flex items-center justify-end pr-1 sm:pr-2 ${
                            racer.boostActive 
                              ? 'bg-gradient-to-r from-[oklch(0.75_0.18_85)] via-[oklch(0.70_0.24_190)] to-[oklch(0.75_0.18_85)]'
                              : 'bg-gradient-to-r from-[oklch(0.70_0.24_190)] to-[oklch(0.75_0.18_85)]'
                          }`}
                          style={{ width: `${(racer.position / trackLength) * 100}%` }}
                        >
                          <span className="text-lg sm:text-2xl">{racer.emoji}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {showPhysicsGraph && physicsData.length > 0 && (
                <Card className="bg-[oklch(0.25_0.03_285)] border-2 border-[oklch(0.70_0.24_190)]">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold text-[oklch(0.75_0.18_85)] mb-4 flex items-center gap-2">
                      📊 Physics Analysis
                    </h3>
                    <div className="bg-[oklch(0.18_0.02_280)] p-4 rounded">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-[oklch(0.65_0.02_280)]">Peak Velocity</div>
                          <div className="text-2xl font-bold text-[oklch(0.75_0.18_85)]">
                            {Math.max(...physicsData.map(p => p.velocity)).toFixed(2)} m/s
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[oklch(0.65_0.02_280)]">Max Force</div>
                          <div className="text-2xl font-bold text-[oklch(0.65_0.15_155)]">
                            {Math.max(...physicsData.map(p => p.force)).toFixed(1)} N
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[oklch(0.65_0.02_280)]">Peak KE</div>
                          <div className="text-2xl font-bold text-[oklch(0.70_0.24_190)]">
                            {Math.max(...physicsData.map(p => p.kineticEnergy)).toFixed(0)} J
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[oklch(0.65_0.02_280)]">Avg Accel</div>
                          <div className="text-2xl font-bold text-[oklch(0.58_0.24_330)]">
                            {(physicsData.reduce((a, b) => a + Math.abs(b.acceleration), 0) / physicsData.length).toFixed(2)} m/s²
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowPhysicsGraph(false)}
                        variant="outline"
                        className="w-full"
                      >
                        Hide Graph
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
                <CardContent className="pt-4 sm:pt-6">
                  <h3 className="text-lg sm:text-xl font-bold text-[oklch(0.75_0.18_85)] mb-4">Race History</h3>
                  {(raceResults || []).length === 0 ? (
                    <p className="text-[oklch(0.65_0.02_280)] text-center py-4 text-sm">
                      No races completed. Win to earn Science Points!
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {[...(raceResults || [])].reverse().slice(0, 5).map((result, index) => (
                        <div key={index} className="flex justify-between items-center bg-[oklch(0.18_0.02_280)] p-2 sm:p-3 rounded text-xs sm:text-sm">
                          <div>
                            <span className="text-white font-bold">
                              {result.position}{getOrdinalSuffix(result.position)} Place
                            </span>
                            <span className="text-[oklch(0.65_0.02_280)] text-xs ml-2">
                              {result.lapTime.toFixed(1)}s
                            </span>
                            <div className="text-[oklch(0.70_0.24_190)] text-xs">
                              Avg: {result.avgVelocity.toFixed(1)} m/s | Max: {result.maxVelocity.toFixed(1)} m/s
                            </div>
                          </div>
                          <Badge className="bg-[oklch(0.65_0.15_155)] text-xs sm:text-sm">
                            +{result.sciencePointsEarned} 🔬
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {(sciencePoints || 0) > 0 && (
                <Button
                  onClick={() => setShowLab(true)}
                  className="w-full bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.70_0.17_155)] text-white text-lg sm:text-xl py-6 sm:py-8"
                >
                  🔬 Enter Science Laboratory
                </Button>
              )}

              <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base sm:text-xl font-bold text-[oklch(0.75_0.18_85)] flex items-center gap-2">
                      <Robot weight="fill" size={20} />
                      Movement AI
                    </h3>
                    <Button
                      size="sm"
                      variant={showAIChat ? "destructive" : "outline"}
                      onClick={() => setShowAIChat(!showAIChat)}
                      className="text-xs"
                    >
                      {showAIChat ? <><X size={14} /> Close</> : <><Robot size={14} weight="fill" /> Chat</>}
                    </Button>
                  </div>

                  {showAIChat && (
                    <div className="space-y-3">
                      <ScrollArea className="h-48 sm:h-64 bg-[oklch(0.18_0.02_280)] rounded p-3" ref={chatScrollRef}>
                        {aiMessages.length === 0 ? (
                          <div className="text-center text-[oklch(0.65_0.02_280)] py-8 text-xs sm:text-sm">
                            <Robot size={32} weight="fill" className="mx-auto mb-2 opacity-50" />
                            <p>Ask about physics, racing strategy, or how the simulation works!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {aiMessages.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[85%] rounded-lg p-2 sm:p-3 text-xs sm:text-sm ${
                                    msg.type === 'user'
                                      ? 'bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)]'
                                      : 'bg-[oklch(0.25_0.03_285)] text-white'
                                  }`}
                                >
                                  {msg.type === 'bot' && (
                                    <div className="flex items-start gap-2">
                                      <Robot size={16} weight="fill" className="mt-0.5 flex-shrink-0" />
                                      <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                  )}
                                  {msg.type === 'user' && msg.content}
                                </div>
                              </div>
                            ))}
                            {isAITyping && (
                              <div className="flex justify-start">
                                <div className="bg-[oklch(0.25_0.03_285)] rounded-lg p-3 flex items-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </ScrollArea>

                      <div className="flex gap-2">
                        <Input
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendAIMessage()
                            }
                          }}
                          placeholder="Ask about physics..."
                          className="flex-1 bg-[oklch(0.15_0.02_280)] border-[oklch(0.35_0.05_285)] text-white text-xs sm:text-sm"
                          disabled={isAITyping}
                        />
                        <Button
                          onClick={handleSendAIMessage}
                          disabled={!currentMessage.trim() || isAITyping}
                          className="bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] text-[oklch(0.15_0.02_280)]"
                          size="sm"
                        >
                          <PaperPlaneTilt weight="fill" size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <ScienceLaboratory 
              sciencePoints={sciencePoints || 0}
              onBack={() => setShowLab(false)}
              onSpendPoints={(amount) => setSciencePoints((current) => (current || 0) - amount)}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
