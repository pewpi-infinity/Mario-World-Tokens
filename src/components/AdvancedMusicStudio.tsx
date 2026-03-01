import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { 
  Play, 
  Pause, 
  Stop, 
  Record, 
  DownloadSimple,
  Waveform,
  MusicNotes,
  PianoKeys,
  SpeakerHigh,
  Equalizer,
  Guitar,
  Microphone,
  Circle,
  Stack
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AdvancedMusicStudioProps {
  open: boolean
  onClose: () => void
  onSaveToToken?: (audioBlob: Blob, metadata: RecordingMetadata) => void
}

interface RecordingMetadata {
  title: string
  artist: string
  duration: number
  timestamp: number
  tracks: TrackInfo[]
}

interface TrackInfo {
  name: string
  instrument: string
  enabled: boolean
}

interface DrumPad {
  id: string
  label: string
  key: string
  color: string
  frequency: number
  type: OscillatorType
}

interface BeatStep {
  active: boolean
}

interface InstrumentNote {
  note: string
  freq: number
  key: string
  white?: boolean
}

export function AdvancedMusicStudio({ open, onClose, onSaveToToken }: AdvancedMusicStudioProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([80])
  const [tempo, setTempo] = useState([120])
  const [trackTitle, setTrackTitle] = useState('')
  const [currentBeat, setCurrentBeat] = useState(0)
  const [isSequencerPlaying, setIsSequencerPlaying] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(0))
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(128))
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sequencerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [beatSequence, setBeatSequence] = useState<BeatStep[][]>(
    Array(8).fill(null).map(() => Array(16).fill(null).map(() => ({ active: false })))
  )

  const drumPads: DrumPad[] = [
    { id: 'kick', label: '🥁 Kick', key: 'Q', color: 'oklch(0.58_0.24_330)', frequency: 80, type: 'sine' },
    { id: 'snare', label: '🎵 Snare', key: 'W', color: 'oklch(0.75_0.18_85)', frequency: 200, type: 'triangle' },
    { id: 'hihat', label: '🔔 HiHat', key: 'E', color: 'oklch(0.70_0.24_190)', frequency: 8000, type: 'square' },
    { id: 'clap', label: '👏 Clap', key: 'R', color: 'oklch(0.65_0.15_155)', frequency: 1000, type: 'square' },
    { id: 'tom1', label: '🎯 Tom 1', key: 'A', color: 'oklch(0.72_0.20_50)', frequency: 150, type: 'sine' },
    { id: 'tom2', label: '🎯 Tom 2', key: 'S', color: 'oklch(0.68_0.18_110)', frequency: 120, type: 'sine' },
    { id: 'cymbal', label: '🥇 Cymbal', key: 'D', color: 'oklch(0.80_0.12_220)', frequency: 10000, type: 'square' },
    { id: 'perc', label: '🎶 Perc', key: 'F', color: 'oklch(0.62_0.22_300)', frequency: 500, type: 'triangle' }
  ]

  const pianoKeys = [
    { note: 'C4', freq: 261.63, key: 'Z', white: true },
    { note: 'C#4', freq: 277.18, key: '2', white: false },
    { note: 'D4', freq: 293.66, key: 'X', white: true },
    { note: 'D#4', freq: 311.13, key: '3', white: false },
    { note: 'E4', freq: 329.63, key: 'C', white: true },
    { note: 'F4', freq: 349.23, key: 'V', white: true },
    { note: 'F#4', freq: 369.99, key: '5', white: false },
    { note: 'G4', freq: 392.00, key: 'B', white: true },
    { note: 'G#4', freq: 415.30, key: '6', white: false },
    { note: 'A4', freq: 440.00, key: 'N', white: true },
    { note: 'A#4', freq: 466.16, key: '7', white: false },
    { note: 'B4', freq: 493.88, key: 'M', white: true }
  ]

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.connect(audioContextRef.current.destination)
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!open) return
      
      const drumPad = drumPads.find(p => p.key === e.key.toUpperCase())
      if (drumPad) {
        playDrum(drumPad)
        return
      }
      
      const pianoKey = pianoKeys.find(k => k.key === e.key.toUpperCase())
      if (pianoKey) {
        playPiano(pianoKey.freq)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [open])

  useEffect(() => {
    if (isSequencerPlaying) {
      const interval = (60 / tempo[0]) * 250
      sequencerIntervalRef.current = setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = (prev + 1) % 16
          playSequenceStep(nextBeat)
          return nextBeat
        })
      }, interval)
    } else {
      if (sequencerIntervalRef.current) {
        clearInterval(sequencerIntervalRef.current)
      }
      setCurrentBeat(0)
    }
    
    return () => {
      if (sequencerIntervalRef.current) {
        clearInterval(sequencerIntervalRef.current)
      }
    }
  }, [isSequencerPlaying, tempo, beatSequence])

  const updateVisualizer = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    setFrequencyData(new Uint8Array(dataArray))
    
    const timeData = new Uint8Array(analyserRef.current.fftSize)
    analyserRef.current.getByteTimeDomainData(timeData)
    const normalized = Array.from(timeData.slice(0, 50)).map(v => (v - 128) / 128)
    setWaveformData(normalized)
    
    if (isRecording || isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateVisualizer)
    }
  }

  const playDrum = async (pad: DrumPad) => {
    if (!audioContextRef.current || !analyserRef.current) return
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const noiseGain = audioContext.createGain()
    
    oscillator.type = pad.type
    oscillator.frequency.value = pad.frequency
    
    gainNode.gain.setValueAtTime(0.3 * (volume[0] / 100), audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)
    
    oscillator.connect(gainNode)
    gainNode.connect(analyserRef.current)
    
    if (pad.id === 'hihat' || pad.id === 'cymbal' || pad.id === 'snare') {
      const bufferSize = audioContext.sampleRate * 0.1
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }
      
      const noise = audioContext.createBufferSource()
      noise.buffer = noiseBuffer
      
      noiseGain.gain.setValueAtTime(0.15 * (volume[0] / 100), audioContext.currentTime)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15)
      
      noise.connect(noiseGain)
      noiseGain.connect(analyserRef.current)
      noise.start(audioContext.currentTime)
      noise.stop(audioContext.currentTime + 0.15)
    }
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
    
    if (!animationFrameRef.current) {
      updateVisualizer()
    }
  }

  const playPiano = async (frequency: number) => {
    if (!audioContextRef.current || !analyserRef.current) return
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.type = 'triangle'
    oscillator.frequency.value = frequency
    
    gainNode.gain.setValueAtTime(0.25 * (volume[0] / 100), audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5)
    
    oscillator.connect(gainNode)
    gainNode.connect(analyserRef.current)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 1.5)
    
    if (!animationFrameRef.current) {
      updateVisualizer()
    }
  }

  const playSequenceStep = (step: number) => {
    beatSequence.forEach((row, rowIndex) => {
      if (row[step].active) {
        playDrum(drumPads[rowIndex])
      }
    })
  }

  const toggleSequenceStep = (row: number, step: number) => {
    setBeatSequence(prev => {
      const newSequence = [...prev]
      newSequence[row] = [...newSequence[row]]
      newSequence[row][step] = { active: !newSequence[row][step].active }
      return newSequence
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream)
        source.connect(analyserRef.current)
        updateVisualizer()
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordedAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setRecordingTime(0)
      toast.success('🎤 Recording started! Voice analyzer active!')
    } catch (error) {
      toast.error('Unable to access microphone')
      console.error('Recording error:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success('⏹️ Recording stopped!')
    }
  }

  const playRecording = async () => {
    if (recordedAudio && audioContextRef.current && analyserRef.current) {
      const audioUrl = URL.createObjectURL(recordedAudio)
      const audio = new Audio(audioUrl)
      audioPlayerRef.current = audio
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }
      
      const source = audioContextRef.current.createMediaElementSource(audio)
      source.connect(analyserRef.current)
      
      audio.volume = volume[0] / 100
      audio.play()
      setIsPlaying(true)
      updateVisualizer()
      
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      }
      
      toast.success('▶️ Playing recording with analyzer')
    }
  }

  const stopPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const downloadRecording = () => {
    if (recordedAudio) {
      const url = URL.createObjectURL(recordedAudio)
      const a = document.createElement('a')
      a.href = url
      a.download = `${trackTitle || 'mario-music'}-${Date.now()}.webm`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('💾 Recording downloaded!')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.18_0.02_290)] border-2 border-[oklch(0.75_0.18_85)]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-[oklch(0.75_0.18_85)] flex items-center gap-3">
            <MusicNotes weight="fill" className="text-4xl" />
            Mario Music Studio Pro 🎵
          </DialogTitle>
          <DialogDescription className="text-[oklch(0.65_0.02_280)] text-base">
            Professional music creation with drum pads, piano, beat sequencer, and oscilloscope
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="drums" className="w-full">
          <TabsList className="grid grid-cols-4 w-full bg-[oklch(0.28_0.04_285)]">
            <TabsTrigger value="drums" className="data-[state=active]:bg-[oklch(0.58_0.24_330)] data-[state=active]:text-white">
              🥁 Drums
            </TabsTrigger>
            <TabsTrigger value="piano" className="data-[state=active]:bg-[oklch(0.75_0.18_85)] data-[state=active]:text-[oklch(0.15_0.02_280)]">
              🎹 Piano
            </TabsTrigger>
            <TabsTrigger value="sequencer" className="data-[state=active]:bg-[oklch(0.70_0.24_190)] data-[state=active]:text-white">
              🎛️ Sequencer
            </TabsTrigger>
            <TabsTrigger value="recorder" className="data-[state=active]:bg-[oklch(0.65_0.15_155)] data-[state=active]:text-white">
              🎤 Record
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 mb-4 space-y-4">
            <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[oklch(0.75_0.18_85)]">Volume: {volume[0]}%</Label>
                    </div>
                    <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[oklch(0.75_0.18_85)]">Tempo: {tempo[0]} BPM</Label>
                    </div>
                    <Slider value={tempo} onValueChange={setTempo} min={40} max={200} step={1} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="p-4">
                <Label className="text-[oklch(0.75_0.18_85)] mb-2 block">Oscilloscope & Spectrum Analyzer</Label>
                <div className="grid grid-cols-2 gap-4 h-32">
                  <div className="bg-[oklch(0.12_0.01_280)] rounded-lg p-2 flex items-center">
                    <svg width="100%" height="100%" viewBox="0 0 200 80" className="overflow-visible">
                      <polyline
                        fill="none"
                        stroke="oklch(0.75_0.18_85)"
                        strokeWidth="2"
                        points={waveformData.map((v, i) => `${i * 4},${40 + v * 30}`).join(' ')}
                      />
                      <line x1="0" y1="40" x2="200" y2="40" stroke="oklch(0.35_0.05_285)" strokeWidth="1" strokeDasharray="2,2" />
                    </svg>
                  </div>
                  <div className="bg-[oklch(0.12_0.01_280)] rounded-lg p-2 flex items-end gap-0.5">
                    {Array.from(frequencyData.slice(0, 64)).map((value, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-[oklch(0.70_0.24_190)] to-[oklch(0.75_0.18_85)] rounded-t"
                        style={{ height: `${Math.max((value / 255) * 100, 2)}%` }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <TabsContent value="drums" className="space-y-4">
            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4">
                  {drumPads.map((pad) => (
                    <Button
                      key={pad.id}
                      onClick={() => playDrum(pad)}
                      className="h-32 text-xl font-bold flex flex-col items-center justify-center gap-2 transition-transform active:scale-95"
                      style={{
                        backgroundColor: pad.color,
                        color: 'white'
                      }}
                    >
                      <div className="text-4xl">{pad.label.split(' ')[0]}</div>
                      <div className="text-sm">{pad.label.split(' ')[1]}</div>
                      <div className="text-xs bg-black/30 px-2 py-1 rounded">{pad.key}</div>
                    </Button>
                  ))}
                </div>
                <p className="text-center text-[oklch(0.65_0.02_280)] mt-4">
                  Click pads or use keyboard keys to play drums
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="piano" className="space-y-4">
            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-6">
                <div className="flex gap-0 justify-center relative" style={{ height: '200px' }}>
                  {pianoKeys.map((key) => (
                    key.white ? (
                      <button
                        key={key.note}
                        onClick={() => playPiano(key.freq)}
                        className="relative bg-gradient-to-b from-white to-gray-200 border-2 border-gray-800 hover:from-[oklch(0.95_0_0)] hover:to-[oklch(0.90_0_0)] active:from-[oklch(0.75_0.18_85)] active:to-[oklch(0.70_0.16_85)] transition-all"
                        style={{ width: '60px', height: '200px' }}
                      >
                        <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-gray-600">
                          {key.note}
                          <div className="text-[10px] bg-gray-800 text-white px-1 rounded mx-auto w-fit mt-1">{key.key}</div>
                        </div>
                      </button>
                    ) : null
                  ))}
                  {pianoKeys.map((key) => (
                    !key.white ? (
                      <button
                        key={key.note}
                        onClick={() => playPiano(key.freq)}
                        className="absolute bg-gradient-to-b from-gray-900 to-black border-2 border-black hover:from-gray-800 hover:to-gray-900 active:from-[oklch(0.75_0.18_85)] active:to-[oklch(0.70_0.16_85)] transition-all"
                        style={{
                          width: '40px',
                          height: '120px',
                          left: `${pianoKeys.filter(k => k.white && pianoKeys.indexOf(k) < pianoKeys.indexOf(key)).length * 60 + 40}px`
                        }}
                      >
                        <div className="text-[10px] text-white font-bold mt-20">
                          <div className="bg-white/20 px-1 rounded">{key.key}</div>
                        </div>
                      </button>
                    ) : null
                  ))}
                </div>
                <p className="text-center text-[oklch(0.65_0.02_280)] mt-6">
                  Use keyboard (Z-M & 2-7 keys) or click to play piano
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sequencer" className="space-y-4">
            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => setIsSequencerPlaying(!isSequencerPlaying)}
                    className={`px-8 ${isSequencerPlaying ? 'bg-[oklch(0.58_0.24_330)]' : 'bg-[oklch(0.65_0.15_155)]'} text-white`}
                  >
                    {isSequencerPlaying ? <Pause weight="fill" /> : <Play weight="fill" />}
                    <span className="ml-2">{isSequencerPlaying ? 'Stop' : 'Play'} Sequence</span>
                  </Button>
                  <Button
                    onClick={() => setBeatSequence(Array(8).fill(null).map(() => Array(16).fill(null).map(() => ({ active: false }))))}
                    variant="outline"
                    className="border-[oklch(0.35_0.05_285)]"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="space-y-1 overflow-x-auto">
                  {drumPads.map((pad, rowIndex) => (
                    <div key={pad.id} className="flex gap-1 items-center">
                      <div
                        className="w-24 text-xs font-bold px-2 py-1 rounded text-white truncate"
                        style={{ backgroundColor: pad.color }}
                      >
                        {pad.label}
                      </div>
                      {beatSequence[rowIndex].map((step, stepIndex) => (
                        <button
                          key={stepIndex}
                          onClick={() => toggleSequenceStep(rowIndex, stepIndex)}
                          className={`w-8 h-8 rounded border-2 transition-all ${
                            step.active
                              ? 'border-white'
                              : 'border-[oklch(0.35_0.05_285)]'
                          } ${
                            currentBeat === stepIndex && isSequencerPlaying
                              ? 'ring-2 ring-[oklch(0.75_0.18_85)]'
                              : ''
                          }`}
                          style={{
                            backgroundColor: step.active ? pad.color : 'oklch(0.18_0.02_280)'
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <p className="text-center text-[oklch(0.65_0.02_280)] text-sm">
                  Click grid squares to create beat patterns • 16 steps per sequence
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recorder" className="space-y-4">
            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-[oklch(0.75_0.18_85)] pixel-font mb-4">
                    {formatTime(recordingTime)}
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    {!isRecording && !recordedAudio && (
                      <Button
                        size="lg"
                        onClick={startRecording}
                        className="bg-[oklch(0.58_0.24_330)] hover:bg-[oklch(0.63_0.26_330)] text-white px-8"
                      >
                        <Record weight="fill" className="mr-2" />
                        Start Recording
                      </Button>
                    )}

                    {isRecording && (
                      <Button
                        size="lg"
                        onClick={stopRecording}
                        className="bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] text-[oklch(0.15_0.02_280)] px-8"
                      >
                        <Stop weight="fill" className="mr-2" />
                        Stop Recording
                      </Button>
                    )}

                    {recordedAudio && !isRecording && (
                      <>
                        {!isPlaying ? (
                          <Button
                            size="lg"
                            onClick={playRecording}
                            className="bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.70_0.17_155)] text-white px-8"
                          >
                            <Play weight="fill" className="mr-2" />
                            Play
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            onClick={stopPlayback}
                            className="bg-[oklch(0.58_0.24_330)] hover:bg-[oklch(0.63_0.26_330)] text-white px-8"
                          >
                            <Stop weight="fill" className="mr-2" />
                            Stop
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            setRecordedAudio(null)
                            setRecordingTime(0)
                          }}
                          variant="outline"
                          className="border-[oklch(0.35_0.05_285)]"
                        >
                          New Recording
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {recordedAudio && (
                  <div className="space-y-4 pt-4 border-t-2 border-[oklch(0.35_0.05_285)]">
                    <div className="space-y-2">
                      <Label htmlFor="track-title" className="text-[oklch(0.75_0.18_85)]">Track Title</Label>
                      <Input
                        id="track-title"
                        value={trackTitle}
                        onChange={(e) => setTrackTitle(e.target.value)}
                        placeholder="My Mario Track"
                        className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)] text-white"
                      />
                    </div>

                    <Button
                      onClick={downloadRecording}
                      className="w-full bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] text-[oklch(0.15_0.02_280)] text-lg font-bold"
                    >
                      <DownloadSimple weight="fill" className="mr-2" />
                      Download Recording 🟡
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
