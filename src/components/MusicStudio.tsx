import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Play, 
  Pause, 
  Stop, 
  Record, 
  DownloadSimple,
  Waveform,
  MusicNotes,
  Guitar,
  PianoKeys,
  Microphone,
  SpeakerHigh,
  Equalizer,
  SlidersHorizontal,
  Faders
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MusicStudioProps {
  open: boolean
  onClose: () => void
  onSaveRecording?: (audioBlob: Blob, metadata: RecordingMetadata) => void
}

interface RecordingMetadata {
  title: string
  artist: string
  duration: number
  timestamp: number
  waveformData?: number[]
}

interface Instrument {
  name: string
  icon: React.ReactNode
  notes: string[]
  octave: number
}

export function MusicStudio({ open, onClose, onSaveRecording }: MusicStudioProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([80])
  const [tempo, setTempo] = useState([120])
  const [selectedInstrument, setSelectedInstrument] = useState('piano')
  const [trackTitle, setTrackTitle] = useState('')
  const [artistName, setArtistName] = useState('')
  const [waveformData, setWaveformData] = useState<number[]>([])
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  const instruments: Instrument[] = [
    { 
      name: 'piano', 
      icon: <PianoKeys weight="fill" />, 
      notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      octave: 4
    },
    { 
      name: 'synth', 
      icon: <Waveform weight="fill" />, 
      notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      octave: 3
    },
    { 
      name: 'guitar', 
      icon: <Guitar weight="fill" />, 
      notes: ['E', 'A', 'D', 'G', 'B', 'E'],
      octave: 2
    }
  ]

  const noteFrequencies: Record<string, number> = {
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
  }

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      stopAllNotes()
    }
  }, [])

  useEffect(() => {
    if (isRecording && !isPaused) {
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
  }, [isRecording, isPaused])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordedAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        generateWaveform(audioBlob)
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setRecordingTime(0)
      toast.success('🎤 Recording started!')
    } catch (error) {
      toast.error('Unable to access microphone')
      console.error('Recording error:', error)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        toast.info('⏯️ Recording resumed')
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        toast.info('⏸️ Recording paused')
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      toast.success('⏹️ Recording stopped!')
    }
  }

  const playRecording = () => {
    if (recordedAudio) {
      const audioUrl = URL.createObjectURL(recordedAudio)
      const audio = new Audio(audioUrl)
      audioPlayerRef.current = audio
      
      audio.volume = volume[0] / 100
      audio.play()
      setIsPlaying(true)
      
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      toast.success('▶️ Playing recording')
    }
  }

  const stopPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const generateWaveform = async (audioBlob: Blob) => {
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    const rawData = audioBuffer.getChannelData(0)
    const samples = 100
    const blockSize = Math.floor(rawData.length / samples)
    const filteredData = []
    
    for (let i = 0; i < samples; i++) {
      const blockStart = blockSize * i
      let sum = 0
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j])
      }
      filteredData.push(sum / blockSize)
    }
    
    setWaveformData(filteredData)
  }

  const playNote = async (note: string, octave: number) => {
    if (!audioContextRef.current) return
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }
    
    const noteKey = `${note}${octave}`
    const frequency = noteFrequencies[noteKey]
    
    if (!frequency) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    
    oscillator.frequency.value = frequency
    
    switch (selectedInstrument) {
      case 'piano':
        oscillator.type = 'sine'
        break
      case 'synth':
        oscillator.type = 'square'
        break
      case 'guitar':
        oscillator.type = 'sawtooth'
        break
    }
    
    gainNode.gain.setValueAtTime(volume[0] / 100, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 1)
    
    oscillator.start()
    oscillator.stop(audioContextRef.current.currentTime + 1)
    
    oscillatorsRef.current.set(noteKey, oscillator)
    
    setTimeout(() => {
      oscillatorsRef.current.delete(noteKey)
    }, 1000)
  }

  const stopAllNotes = () => {
    oscillatorsRef.current.forEach(oscillator => {
      try {
        oscillator.stop()
      } catch (e) {
        // Oscillator already stopped
      }
    })
    oscillatorsRef.current.clear()
  }

  const downloadRecording = () => {
    if (recordedAudio) {
      const url = URL.createObjectURL(recordedAudio)
      const a = document.createElement('a')
      a.href = url
      a.download = `${trackTitle || 'mario-recording'}-${Date.now()}.webm`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('💾 Recording downloaded!')
    }
  }

  const saveToToken = () => {
    if (recordedAudio && onSaveRecording) {
      const metadata: RecordingMetadata = {
        title: trackTitle || 'Untitled Track',
        artist: artistName || 'Unknown Artist',
        duration: recordingTime,
        timestamp: Date.now(),
        waveformData
      }
      onSaveRecording(recordedAudio, metadata)
      toast.success('🎵 Recording saved to mint as Mario Token!')
      onClose()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentInstrument = instruments.find(i => i.name === selectedInstrument) || instruments[0]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.18_0.02_290)] border-2 border-[oklch(0.75_0.18_85)]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-[oklch(0.75_0.18_85)] flex items-center gap-3">
            <MusicNotes weight="fill" className="text-4xl" />
            Mario Music Studio 🎵
          </DialogTitle>
          <DialogDescription className="text-[oklch(0.65_0.02_280)] text-base">
            Create, record, and produce music to mint as Mario Currency tokens
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="recorder" className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-[oklch(0.28_0.04_285)]">
            <TabsTrigger value="recorder" className="data-[state=active]:bg-[oklch(0.75_0.18_85)] data-[state=active]:text-[oklch(0.15_0.02_280)]">
              <Microphone weight="fill" className="mr-2" />
              Recorder
            </TabsTrigger>
            <TabsTrigger value="instruments" className="data-[state=active]:bg-[oklch(0.70_0.24_190)] data-[state=active]:text-white">
              <PianoKeys weight="fill" className="mr-2" />
              Instruments
            </TabsTrigger>
            <TabsTrigger value="mixer" className="data-[state=active]:bg-[oklch(0.65_0.15_155)] data-[state=active]:text-white">
              <Faders weight="fill" className="mr-2" />
              Mixer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recorder" className="space-y-4 mt-6">
            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-6xl font-bold text-[oklch(0.75_0.18_85)] pixel-font">
                    {formatTime(recordingTime)}
                  </div>
                </div>

                {waveformData.length > 0 && (
                  <div className="w-full h-32 bg-[oklch(0.18_0.02_280)] rounded-lg p-4 flex items-end gap-1">
                    {waveformData.map((value, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-[oklch(0.75_0.18_85)] to-[oklch(0.70_0.24_190)] rounded-t"
                        style={{ height: `${Math.max(value * 100, 5)}%` }}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-center gap-4">
                  {!isRecording && !recordedAudio && (
                    <Button
                      size="lg"
                      onClick={startRecording}
                      className="bg-[oklch(0.58_0.24_330)] hover:bg-[oklch(0.63_0.26_330)] text-white px-8 py-6 text-lg"
                    >
                      <Record weight="fill" className="mr-2" size={24} />
                      Start Recording
                    </Button>
                  )}

                  {isRecording && (
                    <>
                      <Button
                        size="lg"
                        onClick={pauseRecording}
                        className="bg-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.75_0.26_190)] text-white px-8 py-6"
                      >
                        {isPaused ? <Play weight="fill" size={24} /> : <Pause weight="fill" size={24} />}
                      </Button>
                      <Button
                        size="lg"
                        onClick={stopRecording}
                        className="bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] text-[oklch(0.15_0.02_280)] px-8 py-6"
                      >
                        <Stop weight="fill" size={24} />
                      </Button>
                    </>
                  )}

                  {recordedAudio && !isRecording && (
                    <>
                      {!isPlaying ? (
                        <Button
                          size="lg"
                          onClick={playRecording}
                          className="bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.70_0.17_155)] text-white px-8 py-6"
                        >
                          <Play weight="fill" className="mr-2" size={24} />
                          Play
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          onClick={stopPlayback}
                          className="bg-[oklch(0.58_0.24_330)] hover:bg-[oklch(0.63_0.26_330)] text-white px-8 py-6"
                        >
                          <Stop weight="fill" className="mr-2" size={24} />
                          Stop
                        </Button>
                      )}
                      <Button
                        size="lg"
                        onClick={() => {
                          setRecordedAudio(null)
                          setWaveformData([])
                          setRecordingTime(0)
                        }}
                        variant="outline"
                        className="border-[oklch(0.35_0.05_285)] px-8 py-6"
                      >
                        New Recording
                      </Button>
                    </>
                  )}
                </div>

                {recordedAudio && (
                  <div className="space-y-4 pt-4 border-t-2 border-[oklch(0.35_0.05_285)]">
                    <div className="grid grid-cols-2 gap-4">
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
                      <div className="space-y-2">
                        <Label htmlFor="artist-name" className="text-[oklch(0.75_0.18_85)]">Artist Name</Label>
                        <Input
                          id="artist-name"
                          value={artistName}
                          onChange={(e) => setArtistName(e.target.value)}
                          placeholder="Your Name"
                          className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)] text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={saveToToken}
                        className="flex-1 bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] text-[oklch(0.15_0.02_280)] py-6 text-lg font-bold"
                      >
                        <MusicNotes weight="fill" className="mr-2" size={24} />
                        Save & Mint as Token 🟡
                      </Button>
                      <Button
                        onClick={downloadRecording}
                        variant="outline"
                        className="border-[oklch(0.35_0.05_285)] py-6"
                      >
                        <DownloadSimple weight="fill" size={24} />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instruments" className="space-y-4 mt-6">
            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-6 space-y-6">
                <div className="flex gap-3 justify-center">
                  {instruments.map((instrument) => (
                    <Button
                      key={instrument.name}
                      onClick={() => setSelectedInstrument(instrument.name)}
                      className={`px-6 py-8 text-lg ${
                        selectedInstrument === instrument.name
                          ? 'bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)]'
                          : 'bg-[oklch(0.28_0.04_285)] text-white hover:bg-[oklch(0.35_0.05_285)]'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-3xl">{instrument.icon}</div>
                        <div className="capitalize">{instrument.name}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label className="text-[oklch(0.75_0.18_85)] text-lg font-bold">
                    Play {currentInstrument.name.toUpperCase()}
                  </Label>
                  <div className="grid grid-cols-7 gap-2">
                    {currentInstrument.notes.map((note) => (
                      <Button
                        key={note}
                        onMouseDown={() => playNote(note, currentInstrument.octave)}
                        onMouseUp={stopAllNotes}
                        onMouseLeave={stopAllNotes}
                        className="h-32 text-xl font-bold bg-gradient-to-b from-white to-[oklch(0.85_0.01_280)] text-[oklch(0.15_0.02_280)] hover:from-[oklch(0.75_0.18_85)] hover:to-[oklch(0.70_0.16_85)] border-2 border-[oklch(0.35_0.05_285)] shadow-lg"
                      >
                        {note}
                      </Button>
                    ))}
                  </div>
                  <p className="text-center text-[oklch(0.65_0.02_280)] text-sm">
                    Click and hold to play notes • Octave {currentInstrument.octave}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mixer" className="space-y-4 mt-6">
            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-6 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <SpeakerHigh weight="fill" size={32} className="text-[oklch(0.75_0.18_85)]" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-[oklch(0.75_0.18_85)] font-bold">Volume</Label>
                        <span className="text-[oklch(0.75_0.18_85)] font-bold">{volume[0]}%</span>
                      </div>
                      <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Equalizer weight="fill" size={32} className="text-[oklch(0.70_0.24_190)]" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-[oklch(0.75_0.18_85)] font-bold">Tempo (BPM)</Label>
                        <span className="text-[oklch(0.75_0.18_85)] font-bold">{tempo[0]}</span>
                      </div>
                      <Slider
                        value={tempo}
                        onValueChange={setTempo}
                        min={40}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.75_0.18_85)]">
                    <CardContent className="pt-6 text-center">
                      <SlidersHorizontal weight="fill" size={48} className="mx-auto mb-3 text-[oklch(0.75_0.18_85)]" />
                      <h4 className="font-bold text-white mb-2">8-Track Mixer</h4>
                      <p className="text-sm text-[oklch(0.65_0.02_280)]">Multi-track recording</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.70_0.24_190)]">
                    <CardContent className="pt-6 text-center">
                      <Waveform weight="fill" size={48} className="mx-auto mb-3 text-[oklch(0.70_0.24_190)]" />
                      <h4 className="font-bold text-white mb-2">Effects</h4>
                      <p className="text-sm text-[oklch(0.65_0.02_280)]">Reverb, delay, chorus</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.65_0.15_155)]">
                    <CardContent className="pt-6 text-center">
                      <MusicNotes weight="fill" size={48} className="mx-auto mb-3 text-[oklch(0.65_0.15_155)]" />
                      <h4 className="font-bold text-white mb-2">Samples</h4>
                      <p className="text-sm text-[oklch(0.65_0.02_280)]">Mario sound library</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-[oklch(0.18_0.02_280)] border-2 border-[oklch(0.35_0.05_285)] rounded-lg p-6">
                  <h4 className="text-[oklch(0.75_0.18_85)] font-bold text-lg mb-4 flex items-center gap-2">
                    <MusicNotes weight="fill" />
                    Professional Tools Available
                  </h4>
                  <ul className="grid grid-cols-2 gap-3 text-[oklch(0.92_0.01_280)]">
                    <li className="flex items-center gap-2">
                      <span className="text-[oklch(0.75_0.18_85)]">🎹</span> Virtual Instruments
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[oklch(0.75_0.18_85)]">🎚️</span> Audio Effects
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[oklch(0.75_0.18_85)]">🎼</span> MIDI Support
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[oklch(0.75_0.18_85)]">🔊</span> Mastering Tools
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[oklch(0.75_0.18_85)]">🎵</span> Loop Library
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[oklch(0.75_0.18_85)]">💾</span> Auto-Save
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
