import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
    { id: 'player', name: 'You (Mario)', emoji: '🏎️', position: 0, lap: 0, speed: 0, powerup: null },
    { id: 'luigi', name: 'Luigi', emoji: '🏁', position: 0, lap: 0, speed: 0, powerup: null },
    { id: 'peach', name: 'Peach', emoji: '👑', position: 0, lap: 0, speed: 0, powerup: null },
    { id: 'bowser', name: 'Bowser', emoji: '🐢', position: 0, lap: 0, speed: 0, powerup: null }
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
            const baseSpeed = racer.id === 'player' ? 3 + Math.random() * 2 : 2 + Math.random() * 3
            const newPosition = racer.position + baseSpeed
            const newLap = racer.lap + Math.floor(newPosition / trackLength)
            const finalPosition = newPosition % trackLength

            if (newLap >= maxLaps && racer.lap < maxLaps) {
              if (racer.id === 'player') {
                finishRace(1, raceTime)
              }
            }

            return {
              ...racer,
              position: finalPosition,
              lap: Math.min(newLap, maxLaps),
              speed: baseSpeed
            }
          })
        })
      }, 200)
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
    setRacers(prevRacers => prevRacers.map(r => ({ ...r, position: 0, lap: 0, speed: 0, powerup: null })))
    setRaceTime(0)
    setIsRacing(true)
    toast.success('🏁 Race Started! Use arrow keys to boost!')
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
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        setRacers(prev => prev.map(r => 
          r.id === 'player' ? { ...r, position: r.position + 5 } : r
        ))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
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
                  <div className="text-center text-[oklch(0.75_0.18_85)] text-sm mb-4">
                    ⬆️ Press Arrow Keys to Boost! ⬆️
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

interface ScienceLaboratoryProps {
  sciencePoints: number
  onBack: () => void
  onSpendPoints: (amount: number) => void
}

function ScienceLaboratory({ sciencePoints, onBack, onSpendPoints }: ScienceLaboratoryProps) {
  const [activeExperiment, setActiveExperiment] = useState<string | null>(null)
  const [experimentResults, setExperimentResults] = useKV<any[]>('experiment-results', [])

  const experiments = [
    {
      id: 'physics-gravity',
      name: '🌍 Gravity Simulator',
      description: 'Study gravitational forces and orbital mechanics',
      cost: 50,
      icon: '🪐',
      subject: 'Physics'
    },
    {
      id: 'chemistry-reactions',
      name: '🧪 Chemical Reactions',
      description: 'Mix compounds and observe molecular interactions',
      cost: 75,
      icon: '⚗️',
      subject: 'Chemistry'
    },
    {
      id: 'physics-waves',
      name: '🌊 Wave Mechanics',
      description: 'Explore sound waves, light, and interference patterns',
      cost: 60,
      icon: '📡',
      subject: 'Physics'
    },
    {
      id: 'chemistry-periodic',
      name: '⚛️ Periodic Table Explorer',
      description: 'Learn element properties and atomic structure',
      cost: 40,
      icon: '🔬',
      subject: 'Chemistry'
    },
    {
      id: 'physics-energy',
      name: '⚡ Energy Conservation',
      description: 'Study kinetic and potential energy transformations',
      cost: 55,
      icon: '🔋',
      subject: 'Physics'
    },
    {
      id: 'chemistry-organic',
      name: '🧬 Organic Chemistry Lab',
      description: 'Build and analyze carbon-based molecules',
      cost: 80,
      icon: '🧫',
      subject: 'Chemistry'
    }
  ]

  const runExperiment = async (experiment: typeof experiments[0]) => {
    if (sciencePoints < experiment.cost) {
      toast.error('Not enough Science Points!')
      return
    }

    onSpendPoints(experiment.cost)
    setActiveExperiment(experiment.id)
    
    toast.info(`🔬 Running ${experiment.name}...`)
    
    setTimeout(async () => {
      const prompt = spark.llmPrompt`You are a science educator. Provide a brief, educational result for a ${experiment.subject} experiment called "${experiment.name}". 
      
      Include:
      1. A simple explanation of what happened (2-3 sentences)
      2. One interesting fact learned
      3. A real-world application
      
      Keep it accessible for ages 10+ and exciting! Format as JSON with keys: explanation, fact, application.`
      
      try {
        const result = await spark.llm(prompt, 'gpt-4o-mini', true)
        const parsed = JSON.parse(result)
        
        setExperimentResults((current) => [
          ...(current || []),
          {
            experimentId: experiment.id,
            experimentName: experiment.name,
            timestamp: Date.now(),
            ...parsed
          }
        ])
        
        toast.success(`✅ Experiment Complete!`)
        setActiveExperiment(null)
      } catch (error) {
        toast.error('Experiment failed - try again!')
        onSpendPoints(-experiment.cost)
        setActiveExperiment(null)
      }
    }, 2000)
  }

  const latestResult = experimentResults && experimentResults.length > 0 
    ? experimentResults[experimentResults.length - 1] 
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[oklch(0.75_0.18_85)] pixel-font">
          🔬 SCIENCE LABORATORY
        </h2>
        <Button onClick={onBack} variant="outline" className="border-[oklch(0.35_0.05_285)]">
          ← Back to Race
        </Button>
      </div>

      <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Available Science Points</h3>
              <p className="text-sm text-[oklch(0.65_0.02_280)]">
                Earn more by racing! Use points to run experiments.
              </p>
            </div>
            <div className="text-4xl font-bold text-[oklch(0.65_0.15_155)]">
              🔬 {sciencePoints}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map(experiment => (
          <Card 
            key={experiment.id}
            className={`bg-[oklch(0.18_0.02_280)] border-2 transition-all ${
              activeExperiment === experiment.id
                ? 'border-[oklch(0.75_0.18_85)] animate-pulse'
                : 'border-[oklch(0.35_0.05_285)] hover:border-[oklch(0.70_0.24_190)]'
            }`}
          >
            <CardContent className="pt-6">
              <div className="text-6xl text-center mb-4">{experiment.icon}</div>
              <h4 className="font-bold text-white text-center mb-2">{experiment.name}</h4>
              <p className="text-sm text-[oklch(0.65_0.02_280)] text-center mb-4">
                {experiment.description}
              </p>
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-[oklch(0.70_0.24_190)]">{experiment.subject}</Badge>
                <Badge className="bg-[oklch(0.75_0.18_85)]">
                  🔬 {experiment.cost}
                </Badge>
              </div>
              <Button
                onClick={() => runExperiment(experiment)}
                disabled={sciencePoints < experiment.cost || activeExperiment !== null}
                className="w-full bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.70_0.17_155)] text-white disabled:opacity-50"
              >
                {activeExperiment === experiment.id ? 'Running...' : 'Run Experiment'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {latestResult && (
        <Card className="bg-[oklch(0.25_0.03_285)] border-2 border-[oklch(0.75_0.18_85)]">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold text-[oklch(0.75_0.18_85)] mb-4">
              📊 Latest Experiment Result
            </h3>
            <div className="bg-[oklch(0.18_0.02_280)] p-4 rounded-lg space-y-3">
              <div>
                <h4 className="font-bold text-white mb-2">{latestResult.experimentName}</h4>
                <p className="text-[oklch(0.92_0.01_280)]">{latestResult.explanation}</p>
              </div>
              <div>
                <h5 className="font-bold text-[oklch(0.75_0.18_85)] text-sm">💡 Interesting Fact:</h5>
                <p className="text-[oklch(0.92_0.01_280)] text-sm">{latestResult.fact}</p>
              </div>
              <div>
                <h5 className="font-bold text-[oklch(0.65_0.15_155)] text-sm">🌍 Real-World Application:</h5>
                <p className="text-[oklch(0.92_0.01_280)] text-sm">{latestResult.application}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {experimentResults && experimentResults.length > 0 && (
        <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-white mb-4">📚 Experiment History</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...experimentResults].reverse().map((result, index) => (
                <div key={index} className="bg-[oklch(0.12_0.01_280)] p-3 rounded">
                  <div className="font-bold text-[oklch(0.75_0.18_85)] text-sm">
                    {result.experimentName}
                  </div>
                  <div className="text-xs text-[oklch(0.65_0.02_280)]">
                    {new Date(result.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
