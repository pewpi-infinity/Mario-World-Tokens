import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Play, 
  Pause, 
  Stop, 
  Record, 
  DownloadSimple,
  Waveform,
  MusicNotes,
  SpeakerHigh,
  Equalizer,
  Microphone,
  Circle,
  Coin,
  Users,
  SignOut,
  UserPlus,
  ChatCircle,
  Lightning,
  GuitarIcon
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { MarioCoin } from '@/lib/types'

interface CollaborativeMusicStudioProps {
  open: boolean
  onClose: () => void
  onMintMusic?: (coin: MarioCoin) => void
  currentUser: string
}

interface SessionUser {
  id: string
  name: string
  color: string
  isRecording: boolean
  lastActivity: number
}

interface Track {
  id: string
  name: string
  instrument: string
  enabled: boolean
  volume: number
  userId: string
  recording: string | null
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: number
}

interface CollabSession {
  id: string
  users: SessionUser[]
  tracks: Track[]
  tempo: number
  volume: number
  isRecording: boolean
  beatSequence: boolean[][]
  chatMessages: ChatMessage[]
  createdAt: number
}

const USER_COLORS = [
  'oklch(0.75_0.18_85)',
  'oklch(0.70_0.24_190)',
  'oklch(0.65_0.15_155)',
  'oklch(0.58_0.24_330)',
  'oklch(0.72_0.20_50)',
  'oklch(0.68_0.18_110)',
  'oklch(0.80_0.12_220)',
  'oklch(0.62_0.22_300)'
]

export function CollaborativeMusicStudio({ open, onClose, onMintMusic, currentUser }: CollaborativeMusicStudioProps) {
  const [sessionId, setSessionId] = useState<string>('')
  const [userName, setUserName] = useState('')
  const [isInSession, setIsInSession] = useState(false)
  const [currentUserColor, setCurrentUserColor] = useState(USER_COLORS[0])
  const [session, setSession] = useKV<CollabSession | null>('collab-music-session', null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [localRecording, setLocalRecording] = useState<Blob | null>(null)
  const [volume, setVolume] = useState([80])
  const [tempo, setTempo] = useState([120])
  const [trackTitle, setTrackTitle] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(0))
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(128))
  const [isSequencerPlaying, setIsSequencerPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sequencerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const sessionSyncRef = useRef<NodeJS.Timeout | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const drumPads = [
    { id: 'kick', label: '🥁 Kick', key: 'Q', color: 'oklch(0.58_0.24_330)', freq: 80, type: 'sine' as OscillatorType },
    { id: 'snare', label: '🎵 Snare', key: 'W', color: 'oklch(0.75_0.18_85)', freq: 200, type: 'triangle' as OscillatorType },
    { id: 'hihat', label: '🔔 HiHat', key: 'E', color: 'oklch(0.70_0.24_190)', freq: 8000, type: 'square' as OscillatorType },
    { id: 'clap', label: '👏 Clap', key: 'R', color: 'oklch(0.65_0.15_155)', freq: 1000, type: 'square' as OscillatorType },
    { id: 'tom1', label: '🎯 Tom 1', key: 'A', color: 'oklch(0.72_0.20_50)', freq: 150, type: 'sine' as OscillatorType },
    { id: 'tom2', label: '🎯 Tom 2', key: 'S', color: 'oklch(0.68_0.18_110)', freq: 120, type: 'sine' as OscillatorType },
    { id: 'cymbal', label: '🥇 Cymbal', key: 'D', color: 'oklch(0.80_0.12_220)', freq: 10000, type: 'square' as OscillatorType },
    { id: 'perc', label: '🎶 Perc', key: 'F', color: 'oklch(0.62_0.22_300)', freq: 500, type: 'triangle' as OscillatorType }
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
      if (sessionSyncRef.current) {
        clearInterval(sessionSyncRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isInSession && session) {
      sessionSyncRef.current = setInterval(() => {
        updateUserActivity()
      }, 2000)
    }
    
    return () => {
      if (sessionSyncRef.current) {
        clearInterval(sessionSyncRef.current)
      }
    }
  }, [isInSession, session])

  useEffect(() => {
    if (session && session.tempo !== tempo[0]) {
      setTempo([session.tempo])
    }
  }, [session?.tempo])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [session?.chatMessages])

  const updateUserActivity = () => {
    if (!session || !isInSession) return
    
    setSession((current) => {
      if (!current) return null
      
      const updatedUsers = current.users.map(u => 
        u.id === currentUser 
          ? { ...u, lastActivity: Date.now(), isRecording }
          : u
      ).filter(u => Date.now() - u.lastActivity < 30000)
      
      return {
        ...current,
        users: updatedUsers
      }
    })
  }

  const createSession = () => {
    if (!userName.trim()) {
      toast.error('Please enter your name')
      return
    }

    const newSessionId = `session-${Date.now()}`
    const userColor = USER_COLORS[0]
    
    const newSession: CollabSession = {
      id: newSessionId,
      users: [{
        id: currentUser,
        name: userName,
        color: userColor,
        isRecording: false,
        lastActivity: Date.now()
      }],
      tracks: [],
      tempo: 120,
      volume: 80,
      isRecording: false,
      beatSequence: Array(8).fill(null).map(() => Array(16).fill(false)),
      chatMessages: [],
      createdAt: Date.now()
    }
    
    setSession(newSession)
    setSessionId(newSessionId)
    setCurrentUserColor(userColor)
    setIsInSession(true)
    toast.success(`🎵 Created session: ${newSessionId}`)
  }

  const joinSession = () => {
    if (!userName.trim() || !sessionId.trim()) {
      toast.error('Please enter your name and session ID')
      return
    }

    if (!session) {
      toast.error('Session not found')
      return
    }

    const existingUser = session.users.find(u => u.id === currentUser)
    if (existingUser) {
      setCurrentUserColor(existingUser.color)
      setIsInSession(true)
      toast.success(`👋 Rejoined session!`)
      return
    }

    const userColor = USER_COLORS[session.users.length % USER_COLORS.length]
    
    setSession((current) => {
      if (!current) return null
      
      return {
        ...current,
        users: [
          ...current.users,
          {
            id: currentUser,
            name: userName,
            color: userColor,
            isRecording: false,
            lastActivity: Date.now()
          }
        ]
      }
    })
    
    setCurrentUserColor(userColor)
    setIsInSession(true)
    
    sendChatMessage(`${userName} joined the session! 🎉`, true)
  }

  const leaveSession = () => {
    if (!session) return
    
    setSession((current) => {
      if (!current) return null
      
      return {
        ...current,
        users: current.users.filter(u => u.id !== currentUser)
      }
    })
    
    setIsInSession(false)
    setSessionId('')
    toast.info('Left the session')
  }

  const sendChatMessage = (message: string, isSystem = false) => {
    if (!session || !message.trim()) return
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      userId: isSystem ? 'system' : currentUser,
      userName: isSystem ? 'System' : userName,
      message: message.trim(),
      timestamp: Date.now()
    }
    
    setSession((current) => {
      if (!current) return null
      
      return {
        ...current,
        chatMessages: [...current.chatMessages, newMessage]
      }
    })
    
    setChatMessage('')
  }

  const updateVisualizer = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    setFrequencyData(new Uint8Array(dataArray))
    
    const timeData = new Uint8Array(analyserRef.current.fftSize)
    analyserRef.current.getByteTimeDomainData(timeData)
    const normalized = Array.from(timeData.slice(0, 50)).map(v => (v - 128) / 128)
    setWaveformData(normalized)
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateVisualizer)
    }
  }

  const playSound = async (frequency: number, instrument: string, duration = 1.5) => {
    if (!audioContextRef.current || !analyserRef.current) return
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(analyserRef.current)
    
    oscillator.frequency.value = frequency
    
    switch (instrument) {
      case 'piano':
        oscillator.type = 'triangle'
        gainNode.gain.setValueAtTime(0.25 * (volume[0] / 100), audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)
        break
      case 'synth':
        oscillator.type = 'square'
        gainNode.gain.setValueAtTime(0.2 * (volume[0] / 100), audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8)
        break
      case 'guitar':
        oscillator.type = 'sawtooth'
        gainNode.gain.setValueAtTime(0.15 * (volume[0] / 100), audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2)
        break
      default:
        oscillator.type = 'triangle'
        gainNode.gain.setValueAtTime(0.2 * (volume[0] / 100), audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)
    }
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
    
    if (!animationFrameRef.current) {
      updateVisualizer()
    }
  }

  const playDrum = async (pad: typeof drumPads[0]) => {
    if (!audioContextRef.current || !analyserRef.current) return
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const noiseGain = audioContext.createGain()
    
    oscillator.type = pad.type
    oscillator.frequency.value = pad.freq
    
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
        setLocalRecording(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      toast.success('🎤 Collaborative Recording Started! All users can record together!')
    } catch (error) {
      toast.error('Unable to access microphone')
      console.error('Recording error:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      toast.success('⏹️ Recording Complete!')
    }
  }

  const mintAsMarioCoin = async () => {
    if (!localRecording || !onMintMusic) return

    const arrayBuffer = await localRecording.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    
    const collaborators = session?.users.map(u => u.name).join(', ') || userName
    
    const newCoin: MarioCoin = {
      id: `collab-music-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serialNumber: `CM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      value: 1,
      mintedBy: currentUser,
      mintedAt: Date.now(),
      content: {
        type: 'music',
        data: `data:audio/webm;base64,${base64}`,
        title: trackTitle || 'Collaborative Track',
        description: `🎵 Collaborative Recording | Artists: ${collaborators} | Duration: ${formatTime(recordingTime)} | Session: ${sessionId}`
      },
      transferHistory: []
    }

    onMintMusic(newCoin)
    setLocalRecording(null)
    setRecordingTime(0)
    setTrackTitle('')
    toast.success('🎵 Collaborative Music Token Minted!')
    
    sendChatMessage(`${userName} minted a collaborative track! 🟡`, true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const updateTempo = (newTempo: number[]) => {
    setTempo(newTempo)
    
    if (!session) return
    
    setSession((current) => {
      if (!current) return null
      return { ...current, tempo: newTempo[0] }
    })
  }

  const toggleSequenceStep = (row: number, step: number) => {
    if (!session) return
    
    setSession((current) => {
      if (!current) return null
      
      const newSequence = [...current.beatSequence]
      newSequence[row] = [...newSequence[row]]
      newSequence[row][step] = !newSequence[row][step]
      
      return {
        ...current,
        beatSequence: newSequence
      }
    })
  }

  const playSequenceStep = (step: number) => {
    if (!session) return
    
    session.beatSequence.forEach((row, rowIndex) => {
      if (row[step] && drumPads[rowIndex]) {
        playDrum(drumPads[rowIndex])
      }
    })
  }

  useEffect(() => {
    if (isSequencerPlaying && session) {
      const interval = (60 / session.tempo) * 250
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
  }, [isSequencerPlaying, session?.tempo, session?.beatSequence])

  if (!isInSession) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.18_0.02_290)] border-2 border-[oklch(0.75_0.18_85)]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-[oklch(0.75_0.18_85)] flex items-center gap-3">
              <Users weight="fill" className="text-4xl" />
              Collaborative Music Studio 🎵
            </DialogTitle>
            <DialogDescription className="text-[oklch(0.65_0.02_280)] text-base">
              Join forces with other musicians to create amazing tracks together in real-time!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-6">
            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-[oklch(0.75_0.18_85)] mb-2 block">Your Name</Label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-[oklch(0.15_0.02_280)] border-[oklch(0.35_0.05_285)] text-white text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button
                    onClick={createSession}
                    className="bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] text-[oklch(0.15_0.02_280)] py-6 text-lg"
                  >
                    <Lightning weight="fill" className="mr-2" />
                    Create New Session
                  </Button>
                  
                  <div className="space-y-2">
                    <Input
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                      placeholder="Session ID"
                      className="bg-[oklch(0.15_0.02_280)] border-[oklch(0.35_0.05_285)] text-white"
                    />
                    <Button
                      onClick={joinSession}
                      className="w-full bg-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.75_0.26_190)] text-white py-6"
                    >
                      <UserPlus weight="fill" className="mr-2" />
                      Join Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[oklch(0.25_0.03_285)] p-4 rounded-lg border border-[oklch(0.35_0.05_285)] text-center">
                <Users weight="fill" size={32} className="mx-auto mb-2 text-[oklch(0.75_0.18_85)]" />
                <div className="text-sm text-[oklch(0.65_0.02_280)]">Multi-User Sync</div>
              </div>
              <div className="bg-[oklch(0.25_0.03_285)] p-4 rounded-lg border border-[oklch(0.35_0.05_285)] text-center">
                <Microphone weight="fill" size={32} className="mx-auto mb-2 text-[oklch(0.70_0.24_190)]" />
                <div className="text-sm text-[oklch(0.65_0.02_280)]">Real-time Recording</div>
              </div>
              <div className="bg-[oklch(0.25_0.03_285)] p-4 rounded-lg border border-[oklch(0.35_0.05_285)] text-center">
                <ChatCircle weight="fill" size={32} className="mx-auto mb-2 text-[oklch(0.65_0.15_155)]" />
                <div className="text-sm text-[oklch(0.65_0.02_280)]">Live Chat</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={() => {
      leaveSession()
      onClose()
    }}>
      <DialogContent className="max-w-[100vw] sm:max-w-[98vw] h-[100dvh] sm:h-[95vh] p-0 flex flex-col overflow-hidden bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.18_0.02_290)] border-2 border-[oklch(0.75_0.18_85)]">
        <div className="p-3 sm:p-4 md:p-6 pb-2 flex-shrink-0 border-b border-[oklch(0.35_0.05_285)]">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[oklch(0.75_0.18_85)] flex items-center gap-2">
                <MusicNotes weight="fill" className="text-xl sm:text-2xl md:text-3xl flex-shrink-0" />
                <span className="truncate text-base sm:text-lg md:text-xl lg:text-2xl">Collab - {sessionId.split('-')[1]}</span>
              </DialogTitle>
              <Button
                onClick={leaveSession}
                variant="outline"
                size="sm"
                className="border-[oklch(0.58_0.24_330)] text-[oklch(0.58_0.24_330)] flex-shrink-0 text-xs sm:text-sm"
              >
                <SignOut weight="fill" className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Leave</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {session?.users.map((user) => (
                <Badge
                  key={user.id}
                  className="px-2 py-1 text-white flex items-center gap-1 sm:gap-2 text-xs"
                  style={{ backgroundColor: user.color }}
                >
                  <Avatar className="w-4 h-4">
                    <AvatarFallback style={{ backgroundColor: user.color, fontSize: '8px' }}>
                      {user.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{user.name}</span>
                  {user.isRecording && <Circle weight="fill" className="text-red-500 animate-pulse" size={8} />}
                </Badge>
              ))}
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col gap-4 w-full">
          <div className="w-full space-y-4 flex-shrink-0 order-2 lg:order-1 lg:max-w-xs">
            <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="p-4 space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-[oklch(0.75_0.18_85)] pixel-font mb-2">
                    {formatTime(recordingTime)}
                  </div>
                  {isRecording && <div className="text-red-500 animate-pulse">● LIVE</div>}
                </div>

                {!isRecording && !localRecording && (
                  <Button
                    onClick={startRecording}
                    className="w-full bg-[oklch(0.58_0.24_330)] hover:bg-[oklch(0.63_0.26_330)] text-white py-6"
                  >
                    <Record weight="fill" className="mr-2" />
                    Start Recording
                  </Button>
                )}

                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    className="w-full bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] text-[oklch(0.15_0.02_280)] py-6"
                  >
                    <Stop weight="fill" className="mr-2" />
                    Stop Recording
                  </Button>
                )}

                {localRecording && !isRecording && (
                  <div className="space-y-2">
                    <Input
                      value={trackTitle}
                      onChange={(e) => setTrackTitle(e.target.value)}
                      placeholder="Track Title"
                      className="bg-[oklch(0.15_0.02_280)] border-[oklch(0.35_0.05_285)] text-white"
                    />
                    <Button
                      onClick={mintAsMarioCoin}
                      className="w-full bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] py-6"
                    >
                      <Coin weight="fill" className="mr-2" />
                      Mint Collab Token 🟡
                    </Button>
                    <Button
                      onClick={() => {
                        setLocalRecording(null)
                        setRecordingTime(0)
                      }}
                      variant="outline"
                      className="w-full border-[oklch(0.35_0.05_285)]"
                    >
                      New Recording
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
              <CardHeader className="pb-3">
                <Label className="text-[oklch(0.75_0.18_85)] font-bold flex items-center gap-2">
                  <ChatCircle weight="fill" />
                  Live Chat
                </Label>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <ScrollArea className="h-64 pr-4" ref={chatScrollRef}>
                  <div className="space-y-2">
                    {session?.chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2 rounded text-sm ${
                          msg.userId === 'system'
                            ? 'bg-[oklch(0.28_0.04_285)] text-[oklch(0.75_0.18_85)] italic'
                            : msg.userId === currentUser
                            ? 'bg-[oklch(0.70_0.24_190)] text-white ml-4'
                            : 'bg-[oklch(0.25_0.03_285)] text-white'
                        }`}
                      >
                        {msg.userId !== 'system' && (
                          <div className="font-bold text-xs opacity-70 mb-1">{msg.userName}</div>
                        )}
                        <div>{msg.message}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(chatMessage)}
                    placeholder="Type a message..."
                    className="bg-[oklch(0.15_0.02_280)] border-[oklch(0.35_0.05_285)] text-white"
                  />
                  <Button
                    onClick={() => sendChatMessage(chatMessage)}
                    size="icon"
                    className="bg-[oklch(0.70_0.24_190)]"
                  >
                    <ChatCircle weight="fill" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <Label className="text-[oklch(0.75_0.18_85)]">Volume: {volume[0]}%</Label>
                  <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[oklch(0.75_0.18_85)]">Tempo: {session?.tempo || tempo[0]} BPM</Label>
                  <Slider
                    value={[session?.tempo || tempo[0]]}
                    onValueChange={updateTempo}
                    min={40}
                    max={200}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 w-full order-1 lg:order-2">
            <Tabs defaultValue="piano" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-4 w-full bg-[oklch(0.28_0.04_285)] mb-4 flex-shrink-0">
                <TabsTrigger value="piano" className="data-[state=active]:bg-[oklch(0.75_0.18_85)] data-[state=active]:text-[oklch(0.15_0.02_280)] text-xs sm:text-sm">
                  🎹 <span className="hidden sm:inline">Piano</span>
                </TabsTrigger>
                <TabsTrigger value="drums" className="data-[state=active]:bg-[oklch(0.58_0.24_330)] data-[state=active]:text-white text-xs sm:text-sm">
                  🥁 <span className="hidden sm:inline">Drums</span>
                </TabsTrigger>
                <TabsTrigger value="sequencer" className="data-[state=active]:bg-[oklch(0.65_0.15_155)] data-[state=active]:text-white text-xs sm:text-sm">
                  🎛️ <span className="hidden sm:inline">Seq</span>
                </TabsTrigger>
                <TabsTrigger value="visualizer" className="data-[state=active]:bg-[oklch(0.68_0.18_110)] data-[state=active]:text-white text-xs sm:text-sm">
                  📊 <span className="hidden sm:inline">Audio</span>
                </TabsTrigger>
              </TabsList>

                <TabsContent value="piano" className="m-0 flex-1">
                  <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)] h-full">
                    <CardContent className="pt-6 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                      <div className="flex gap-0 justify-center relative min-w-max mx-auto" style={{ height: '220px', width: 'fit-content' }}>
                        {pianoKeys.map((key) => (
                          key.white ? (
                            <button
                              key={key.note}
                              onClick={() => playSound(key.freq, 'piano')}
                              className="relative bg-gradient-to-b from-white to-gray-200 border-2 border-gray-800 hover:from-[oklch(0.95_0_0)] hover:to-[oklch(0.90_0_0)] active:from-[oklch(0.75_0.18_85)] active:to-[oklch(0.70_0.16_85)] transition-all"
                              style={{ width: '70px', height: '220px' }}
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
                              onClick={() => playSound(key.freq, 'piano')}
                              className="absolute bg-gradient-to-b from-gray-900 to-black border-2 border-black hover:from-gray-800 hover:to-gray-900 active:from-[oklch(0.75_0.18_85)] active:to-[oklch(0.70_0.16_85)] transition-all z-10"
                              style={{
                                width: '45px',
                                height: '130px',
                                left: `${pianoKeys.filter(k => k.white && pianoKeys.indexOf(k) < pianoKeys.indexOf(key)).length * 70 + 45}px`
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
                        Everyone can play together! Use keyboard or click keys
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="drums" className="p-4 m-0">
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
                        Synchronized drum pads - all users hear the same beats!
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sequencer" className="p-4 m-0">
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
                          onClick={() => {
                            setSession((current) => {
                              if (!current) return null
                              return {
                                ...current,
                                beatSequence: Array(8).fill(null).map(() => Array(16).fill(false))
                              }
                            })
                          }}
                          variant="outline"
                          className="border-[oklch(0.35_0.05_285)]"
                        >
                          Clear All
                        </Button>
                      </div>

                      <ScrollArea className="h-96">
                        <div className="space-y-1">
                          {drumPads.map((pad, rowIndex) => (
                            <div key={pad.id} className="flex gap-1 items-center">
                              <div
                                className="w-24 text-xs font-bold px-2 py-1 rounded text-white truncate"
                                style={{ backgroundColor: pad.color }}
                              >
                                {pad.label}
                              </div>
                              {session?.beatSequence[rowIndex]?.map((active, stepIndex) => (
                                <button
                                  key={stepIndex}
                                  onClick={() => toggleSequenceStep(rowIndex, stepIndex)}
                                  className={`w-10 h-10 rounded border-2 transition-all ${
                                    active
                                      ? 'border-white'
                                      : 'border-[oklch(0.35_0.05_285)]'
                                  } ${
                                    currentBeat === stepIndex && isSequencerPlaying
                                      ? 'ring-2 ring-[oklch(0.75_0.18_85)]'
                                      : ''
                                  }`}
                                  style={{
                                    backgroundColor: active ? pad.color : 'oklch(0.18_0.02_280)'
                                  }}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <p className="text-center text-[oklch(0.65_0.02_280)] text-sm">
                        Shared sequencer - everyone edits and hears the same pattern!
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="visualizer" className="p-4 m-0">
                  <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <Label className="text-[oklch(0.75_0.18_85)] mb-3 block text-lg">Oscilloscope (Waveform)</Label>
                        <div className="bg-[oklch(0.12_0.01_280)] rounded-lg p-4 h-48 flex items-center">
                          <svg width="100%" height="100%" viewBox="0 0 400 120" className="overflow-visible">
                            <polyline
                              fill="none"
                              stroke="oklch(0.75_0.18_85)"
                              strokeWidth="3"
                              points={waveformData.map((v, i) => `${i * 8},${60 + v * 45}`).join(' ')}
                            />
                            <line x1="0" y1="60" x2="400" y2="60" stroke="oklch(0.35_0.05_285)" strokeWidth="1" strokeDasharray="4,4" />
                          </svg>
                        </div>
                      </div>

                      <div>
                        <Label className="text-[oklch(0.75_0.18_85)] mb-3 block text-lg">Frequency Spectrum Analyzer</Label>
                        <div className="bg-[oklch(0.12_0.01_280)] rounded-lg p-4 h-48 flex items-end gap-1">
                          {Array.from(frequencyData.slice(0, 80)).map((value, index) => (
                            <div
                              key={index}
                              className="flex-1 bg-gradient-to-t from-[oklch(0.70_0.24_190)] via-[oklch(0.75_0.18_85)] to-[oklch(0.58_0.24_330)] rounded-t"
                              style={{ height: `${Math.max((value / 255) * 100, 2)}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="bg-[oklch(0.18_0.02_280)] p-4 rounded-lg text-center">
                          <SpeakerHigh weight="fill" size={32} className="mx-auto mb-2 text-[oklch(0.75_0.18_85)]" />
                          <div className="text-sm text-[oklch(0.65_0.02_280)]">Live Audio</div>
                        </div>
                        <div className="bg-[oklch(0.18_0.02_280)] p-4 rounded-lg text-center">
                          <Waveform weight="fill" size={32} className="mx-auto mb-2 text-[oklch(0.70_0.24_190)]" />
                          <div className="text-sm text-[oklch(0.65_0.02_280)]">Wave Analysis</div>
                        </div>
                        <div className="bg-[oklch(0.18_0.02_280)] p-4 rounded-lg text-center">
                          <Equalizer weight="fill" size={32} className="mx-auto mb-2 text-[oklch(0.65_0.15_155)]" />
                          <div className="text-sm text-[oklch(0.65_0.02_280)]">Frequency Data</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
            </Tabs>
          </div>
        </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
