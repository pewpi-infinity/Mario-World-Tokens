import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScienceLaboratory } from '@/components/ScienceLaboratory'
import { toast } from 'sonner'

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
  powerup: string | null
}

interface RaceResult {
  timestamp: number
  position: number
  lapTime: number
  sciencePointsEarned: number
}

export function MarioRaceTrack({ open, onClose }: MarioRaceTrackProps) {
  const [raceResults, setRaceResults] = useKV<RaceResult[]>('race-results', [])
  const [sciencePoints, setSciencePoints] = useKV<number>('science-points', 0)
  const [isRacing, setIsRacing] = useState(false)
  const [raceTime, setRaceTime] = useState(0)
  const [showLab, setShowLab] = useState(false)
  const [racers, setRacers] = useState<Racer[]>([
    { id: 'player', name: 'You (Mario)', emoji: '🏎️', position: 0, lap: 0, speed: 0, velocity: 0, acceleration: 0, mass: 100, friction: 0.95, powerup: null },
    { id: 'luigi', name: 'Luigi', emoji: '🏁', position: 0, lap: 0, speed: 0, velocity: 0, acceleration: 0, mass: 95, friction: 0.96, powerup: null },
    { id: 'peach', name: 'Peach', emoji: '👑', position: 0, lap: 0, speed: 0, velocity: 0, acceleration: 0, mass: 90, friction: 0.97, powerup: null },
    { id: 'bowser', name: 'Bowser', emoji: '🐢', position: 0, lap: 0, speed: 0, velocity: 0, acceleration: 0, mass: 120, friction: 0.93, powerup: null }
  ])

  const raceIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const maxLaps = 3
  const trackLength = 100

  useEffect(() => {
    if (isRacing) {
      timerRef.current = setInterval(() => {
        setRaceTime(prev => prev + 0.1)
      }, 100)
      
      raceIntervalRef.current = setInterval(() => {
        setRacers(prevRacers => {
          return prevRacers.map(racer => {
            let acc = racer.acceleration
            
            if (racer.id !== 'player') {
              acc = (Math.random() - 0.4) * 2
            }
            
            const force = acc * racer.mass
            const newVelocity = (racer.velocity + force / racer.mass) * racer.friction
            const clampedVelocity = Math.max(-5, Math.min(8, newVelocity))
            
            const newPosition = racer.position + clampedVelocity
            const newLap = racer.lap + Math.floor(newPosition / trackLength)
            const finalPosition = newPosition % trackLength

            if (newLap >= maxLaps && racer.lap < maxLaps) {
              if (racer.id === 'player') {
                finishRace(1, raceTime)
              }
            }

            return {
              ...racer,
              position: finalPosition < 0 ? trackLength + finalPosition : finalPosition,
              lap: Math.min(newLap, maxLaps),
              velocity: clampedVelocity,
              acceleration: racer.id === 'player' ? 0 : acc,
              speed: Math.abs(clampedVelocity)
            }
          })
        })
      }, 100)
    } else {
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRacing, raceTime])

  const startRace = () => {
    setRacers(prevRacers => prevRacers.map(r => ({ ...r, position: 0, lap: 0, speed: 0, velocity: 0, acceleration: 0, powerup: null })))
    setRaceTime(0)
    setIsRacing(true)
    toast.success('🏁 Race Started! Use arrow keys for acceleration/braking!')
  }

  const finishRace = (position: number, time: number) => {
    setIsRacing(false)
    const pointsEarned = Math.max(100 - position * 20, 10)
    
    setSciencePoints((current) => (current || 0) + pointsEarned)
    setRaceResults((current) => [
      ...(current || []),
      {
        timestamp: Date.now(),
        position,
        lapTime: time,
        sciencePointsEarned: pointsEarned
      }
    ])
    
    toast.success(`🏆 Finished ${position}${getOrdinalSuffix(position)}! Earned ${pointsEarned} Science Points!`)
    setTimeout(() => setShowLab(true), 1000)
  }

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRacing || !open) return
      
      setRacers(prev => prev.map(r => {
        if (r.id !== 'player') return r
        
        let newAcc = r.acceleration
        
        if (e.key === 'ArrowUp') {
          newAcc = 1.5
        } else if (e.key === 'ArrowDown') {
          newAcc = -1.2
        } else if (e.key === 'ArrowLeft') {
          newAcc = -0.3
        } else if (e.key === 'ArrowRight') {
          newAcc = 1.5
        }
        
        return { ...r, acceleration: newAcc }
      }))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isRacing || !open) return
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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

  const sortedRacers = [...racers].sort((a, b) => {
    if (a.lap !== b.lap) return b.lap - a.lap
    return b.position - a.position
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.18_0.02_290)] border-2 border-[oklch(0.75_0.18_85)]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-[oklch(0.75_0.18_85)] flex items-center gap-3 pixel-font">
            🏁 MARIO RACE TRACK
          </DialogTitle>
        </DialogHeader>

        {!showLab ? (
          <div className="space-y-6">
            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-4xl font-bold text-[oklch(0.75_0.18_85)] pixel-font">
                      {raceTime.toFixed(1)}s
                    </div>
                    <div className="text-sm text-[oklch(0.65_0.02_280)]">
                      {racers[0].lap}/{maxLaps} Laps
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[oklch(0.65_0.15_155)]">
                      🔬 {sciencePoints || 0} Points
                    </div>
                    <div className="text-xs text-[oklch(0.65_0.02_280)]">
                      Science Lab Currency
                    </div>
                  </div>
                </div>

                {!isRacing && (
                  <Button
                    onClick={startRace}
                    className="w-full bg-[oklch(0.58_0.24_330)] hover:bg-[oklch(0.63_0.26_330)] text-white text-xl py-8 pixel-font"
                  >
                    🏁 START RACE!
                  </Button>
                )}

                {isRacing && (
                  <div className="space-y-2">
                    <div className="text-center text-[oklch(0.75_0.18_85)] text-sm">
                      ⬆️ Accelerate | ⬇️ Brake | Physics Simulation Active!
                    </div>
                    <div className="bg-[oklch(0.18_0.02_280)] p-3 rounded text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[oklch(0.65_0.02_280)]">Velocity:</span>
                        <span className="text-white font-bold">{racers[0].velocity.toFixed(2)} units/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[oklch(0.65_0.02_280)]">Acceleration:</span>
                        <span className="text-white font-bold">{racers[0].acceleration.toFixed(2)} m/s²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[oklch(0.65_0.02_280)]">Mass:</span>
                        <span className="text-white font-bold">{racers[0].mass} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[oklch(0.65_0.02_280)]">Friction:</span>
                        <span className="text-white font-bold">{(racers[0].friction * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-xl font-bold text-[oklch(0.75_0.18_85)] mb-4">Race Track</h3>
                {sortedRacers.map((racer, index) => (
                  <div key={racer.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={`${
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
                          <Badge className="bg-[oklch(0.65_0.15_155)] text-white">YOU</Badge>
                        )}
                      </div>
                      <div className="text-[oklch(0.75_0.18_85)] font-bold">
                        Lap {racer.lap}/{maxLaps}
                      </div>
                    </div>
                    <div className="relative bg-[oklch(0.12_0.01_280)] rounded-full h-8 border-2 border-[oklch(0.35_0.05_285)]">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[oklch(0.70_0.24_190)] to-[oklch(0.75_0.18_85)] rounded-full transition-all duration-200 flex items-center justify-end pr-2"
                        style={{ width: `${(racer.position / trackLength) * 100}%` }}
                      >
                        <span className="text-2xl">{racer.emoji}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-[oklch(0.75_0.18_85)] mb-4">Race History</h3>
                {(raceResults || []).length === 0 ? (
                  <p className="text-[oklch(0.65_0.02_280)] text-center py-4">
                    No races completed yet. Win races to earn Science Points!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {[...(raceResults || [])].reverse().slice(0, 5).map((result, index) => (
                      <div key={index} className="flex justify-between items-center bg-[oklch(0.18_0.02_280)] p-3 rounded">
                        <div>
                          <span className="text-white font-bold">
                            {result.position}{getOrdinalSuffix(result.position)} Place
                          </span>
                          <span className="text-[oklch(0.65_0.02_280)] text-sm ml-2">
                            {result.lapTime.toFixed(1)}s
                          </span>
                        </div>
                        <Badge className="bg-[oklch(0.65_0.15_155)]">
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
                className="w-full bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.70_0.17_155)] text-white text-xl py-6"
              >
                🔬 Enter Science Laboratory
              </Button>
            )}
          </div>
        ) : (
          <ScienceLaboratory 
            sciencePoints={sciencePoints || 0}
            onBack={() => setShowLab(false)}
            onSpendPoints={(amount) => setSciencePoints((current) => (current || 0) - amount)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}


