import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Play, Pause, SkipForward, SkipBack, SpeakerHigh, SpeakerSlash, Robot, PaperPlaneTilt, MagnifyingGlass } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Song {
  id: string
  name: string
  level: string
  url: string
  tempo?: 'normal' | 'fast' | 'star'
}

const MARIO_SONGS: Song[] = [
  { id: '1', name: 'Main Theme', level: 'Level 1-1', url: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/06%20Super%20Mario%20Bros.%20-%20Ground%20Theme%20BGM.mp3', tempo: 'normal' },
  { id: '2', name: 'Underground', level: 'Level 1-2', url: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/01%20Super%20Mario%20Bros.%20-%20Underground%20BGM.mp3', tempo: 'normal' },
  { id: '3', name: 'Star Theme', level: 'Level 1-3', url: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/07%20Super%20Mario%20Bros.%20-%20Starman%20BGM.mp3', tempo: 'star' },
  { id: '4', name: 'Water World', level: 'Level 2-1', url: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/09%20Super%20Mario%20Bros.%20-%20Underwater%20BGM.mp3', tempo: 'normal' },
  { id: '5', name: 'Castle', level: 'Level 2-2', url: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/03%20Super%20Mario%20Bros.%20-%20Castle%20BGM.mp3', tempo: 'normal' },
  { id: '6', name: 'Hurry Up', level: 'Level 2-3', url: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/02%20Super%20Mario%20Bros.%20-%20Hurry%21.mp3', tempo: 'fast' },
  { id: '7', name: 'Game Over', level: 'Level 3-1', url: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/05%20Super%20Mario%20Bros.%20-%20Game%20Over.mp3', tempo: 'normal' },
  { id: '8', name: 'World Clear', level: 'Level 3-2', url: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/08%20Super%20Mario%20Bros.%20-%20World%20Clear%20Fanfare.mp3', tempo: 'normal' },
  { id: '9', name: 'Ending', level: 'Level 3-3', url: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/04%20Super%20Mario%20Bros.%20-%20Ending.mp3', tempo: 'normal' },
  { id: '10', name: 'Bonus Stage', level: 'Bonus', url: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/10%20Super%20Mario%20Bros.%202%20-%20Invincibility%20BGM.mp3', tempo: 'star' }
]

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

interface UserAction {
  type: string
  timestamp: number
  details?: string
}

interface MarioJukeboxProps {
  open: boolean
  onClose: () => void
  initialLevel?: string
}

export function MarioJukebox({ open, onClose, initialLevel }: MarioJukeboxProps) {
  const [songs, setSongs] = useState<Song[]>(MARIO_SONGS)
  const [currentSong, setCurrentSong] = useState<Song>(MARIO_SONGS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [showChat, setShowChat] = useState(true)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: '🎵 Jukebox AI activated! I can control playback, search the internet for music info, and watch your actions to play the perfect soundtrack!',
      timestamp: Date.now()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [userActions, setUserActions] = useState<UserAction[]>([])
  const [clickSpeed, setClickSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')
  const [audioReady, setAudioReady] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const lastClickTimeRef = useRef<number>(0)

  useEffect(() => {
    if (open && audioRef.current) {
      const audio = audioRef.current
      
      const handleCanPlay = () => {
        setAudioReady(true)
        console.log('✅ Audio ready to play')
      }

      const handleWaiting = () => {
        console.log('⏳ Audio buffering...')
      }

      audio.addEventListener('canplay', handleCanPlay)
      audio.addEventListener('waiting', handleWaiting)

      return () => {
        audio.removeEventListener('canplay', handleCanPlay)
        audio.removeEventListener('waiting', handleWaiting)
      }
    }
  }, [open, audioReady])

  useEffect(() => {
    if (initialLevel) {
      const levelSong = songs.find(s => s.level === initialLevel)
      if (levelSong) {
        setCurrentSong(levelSong)
      }
    }
  }, [initialLevel, songs])

  useEffect(() => {
    if (open) {
      setCurrentSong(MARIO_SONGS[0])
      setIsPlaying(true)
    }
  }, [open])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedData = () => {
      console.log('✅ Audio loaded:', currentSong.name)
    }

    const handleError = (e: Event) => {
      console.error('❌ Audio loading error:', e)
      setIsPlaying(false)
    }

    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('error', handleError)

    audio.load()

    if (isPlaying && open) {
      audio.currentTime = 0
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🎵 Jukebox playing:', currentSong.name)
          })
          .catch((error) => {
            console.error('❌ Jukebox play failed:', error.message)
            setIsPlaying(false)
          })
      }
    } else if (!open && audio) {
      audio.pause()
      setIsPlaying(false)
    }

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('error', handleError)
    }
  }, [currentSong, isPlaying, open])

  useEffect(() => {
    const recentActions = userActions.slice(-5)
    const now = Date.now()
    const actionCount = recentActions.filter(a => now - a.timestamp < 3000).length

    if (actionCount >= 5) {
      setClickSpeed('fast')
      suggestSongByBehavior('fast')
    } else if (actionCount >= 3) {
      setClickSpeed('normal')
    } else {
      setClickSpeed('slow')
    }
  }, [userActions])

  const trackUserAction = (type: string, details?: string) => {
    const action: UserAction = {
      type,
      timestamp: Date.now(),
      details
    }
    setUserActions((prev) => [...prev, action])
  }

  const suggestSongByBehavior = async (behavior: string) => {
    if (behavior === 'fast' && clickSpeed !== 'fast') {
      const fastSong = MARIO_SONGS.find(s => s.tempo === 'fast' || s.tempo === 'star')
      if (fastSong && fastSong.id !== currentSong.id) {
        addAIMessage(`🚀 I noticed you're moving fast! Switching to "${fastSong.name}" to match your energy!`)
        setTimeout(() => {
          setCurrentSong(fastSong)
          setIsPlaying(true)
          toast.success('🎵 AI switched to fast tempo!', { description: fastSong.name })
        }, 1000)
      }
    }
  }

  const addAIMessage = (content: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content,
        timestamp: Date.now()
      }
    ])
  }

  const handleAICommand = async (message: string) => {
    const lower = message.toLowerCase()

    if (lower.includes('play')) {
      if (lower.includes('star') || lower.includes('invincible')) {
        const starSong = MARIO_SONGS.find(s => s.name.includes('Star') || s.name.includes('Invincibility'))
        if (starSong) {
          setCurrentSong(starSong)
          setIsPlaying(true)
          return `🌟 Playing ${starSong.name}! You're invincible!`
        }
      } else if (lower.includes('fast') || lower.includes('hurry')) {
        const fastSong = MARIO_SONGS.find(s => s.name.includes('Hurry'))
        if (fastSong) {
          setCurrentSong(fastSong)
          setIsPlaying(true)
          return `⏰ Playing ${fastSong.name}! Time's running out!`
        }
      } else if (lower.includes('victory') || lower.includes('clear') || lower.includes('complete')) {
        const victorySong = MARIO_SONGS.find(s => s.name.includes('Clear'))
        if (victorySong) {
          setCurrentSong(victorySong)
          setIsPlaying(true)
          return `🏁 Playing ${victorySong.name}! Level complete!`
        }
      } else {
        setIsPlaying(true)
        return `▶️ Playing ${currentSong.name}!`
      }
    }

    const urlMatch = message.match(/https?:\/\/\S+/i)
    if (urlMatch && (lower.includes('add song') || lower.includes('add track') || lower.includes('add music'))) {
      const songUrl = urlMatch[0]
      const cleanedName = message
        .replace(/https?:\/\/\S+/i, '')
        .replace(/add\s+(song|track|music)\s*/i, '')
        .trim()
      const songName = cleanedName || `Custom Track ${songs.length + 1}`
      const existingSong = songs.find(s => s.url === songUrl)

      if (existingSong) {
        setCurrentSong(existingSong)
        setIsPlaying(true)
        return `🎵 "${existingSong.name}" is already in your playlist. Playing it now!`
      }

      const newSong: Song = {
        id: crypto.randomUUID(),
        name: songName,
        level: 'Custom',
        url: songUrl,
        tempo: 'normal'
      }
      setSongs((prev) => [...prev, newSong])
      setCurrentSong(newSong)
      setIsPlaying(true)
      return `✅ Added "${songName}" to the playlist and started playback.`
    }

    if (lower.includes('pause') || lower.includes('stop')) {
      setIsPlaying(false)
      return `⏸️ Music paused.`
    }

    if (lower.includes('next') || lower.includes('skip')) {
      handleNext()
      return `⏭️ Skipping to next track!`
    }

    if (lower.includes('previous') || lower.includes('back')) {
      handlePrevious()
      return `⏮️ Going back to previous track!`
    }

    if (lower.includes('volume')) {
      if (lower.includes('up') || lower.includes('louder')) {
        const newVol = Math.min(1, volume + 0.2)
        setVolume(newVol)
        return `🔊 Volume increased to ${Math.round(newVol * 100)}%`
      } else if (lower.includes('down') || lower.includes('quieter') || lower.includes('lower')) {
        const newVol = Math.max(0, volume - 0.2)
        setVolume(newVol)
        return `🔉 Volume decreased to ${Math.round(newVol * 100)}%`
      }
    }

    if (lower.includes('mute')) {
      setIsMuted(true)
      return `🔇 Audio muted.`
    }

    if (lower.includes('unmute')) {
      setIsMuted(false)
      return `🔊 Audio unmuted.`
    }

    if (lower.includes('list') || lower.includes('playlist') || lower.includes('songs')) {
      const songList = songs.map((s, i) => `${i + 1}. ${s.name} (${s.level})`).join('\n')
      return `🎼 Available songs:\n${songList}\n\nJust tell me which one to play!`
    }

    if (lower.includes('search') || lower.includes('info') || lower.includes('about')) {
      const prompt = window.spark.llmPrompt`Find the best available version of the requested Mario-related music from Internet Archive for: ${message}. Prioritize archive.org links with high quality or complete tracks. Return a concise response with one best link and a short reason it's the best option. If no suitable archive.org result exists, clearly say that and provide the next best reliable source.`
      
      try {
        const response = await window.spark.llm(prompt, 'gpt-4o-mini')
        return `🔍 ${response}`
      } catch (error) {
        return `🔍 I can search the internet for music info! Try asking: "search for Mario music history" or "info about Koji Kondo"`
      }
    }

    const prompt = window.spark.llmPrompt`You are a helpful AI assistant embedded in a Mario music jukebox. The user said: "${message}". 

Current context:
- Currently playing: ${currentSong.name} (${currentSong.level})
- Is playing: ${isPlaying}
- Volume: ${Math.round(volume * 100)}%
- Available songs: ${songs.map(s => s.name).join(', ')}
- User click speed: ${clickSpeed}

Respond naturally and helpfully. You can:
- Control playback (play, pause, next, previous)
- Search the internet for music information
- Recommend songs based on user mood
- Provide fun facts about Mario music
- Explain what each song is for

Keep your response friendly and concise (2-3 sentences max).`

    try {
      const response = await window.spark.llm(prompt, 'gpt-4o-mini')
      return response
    } catch (error) {
      return `🎵 I can help you control playback, search for music info, and recommend songs! Try: "play the star theme" or "search for Mario composer"`
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    }

    setChatMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setIsAIThinking(true)
    trackUserAction('chat_message', inputMessage)

    try {
      const response = await handleAICommand(inputMessage)
      addAIMessage(response)
    } catch (error) {
      addAIMessage('❌ Sorry, I encountered an error. Please try again!')
    } finally {
      setIsAIThinking(false)
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) {
      return
    }
    
    trackUserAction(isPlaying ? 'pause' : 'play', currentSong.name)
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.currentTime = 0
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            console.log('✅ Playback started successfully')
          })
          .catch((error) => {
            console.error('❌ Play failed:', error.name, error.message)
            setIsPlaying(false)
          })
      }
    }
  }

  const handleNext = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % songs.length
    setCurrentSong(songs[nextIndex])
    trackUserAction('next', songs[nextIndex].name)
    if (open) {
      setIsPlaying(true)
    }
  }

  const handlePrevious = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong.id)
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1
    setCurrentSong(songs[prevIndex])
    trackUserAction('previous', songs[prevIndex].name)
    if (open) {
      setIsPlaying(true)
    }
  }

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song)
    trackUserAction('song_select', song.name)
    if (open) {
      setIsPlaying(true)
    }
  }

  const handleSongEnd = () => {
    handleNext()
  }

  const getLevelColor = (level: string) => {
    if (level.includes('1-')) return 'bg-[oklch(0.75_0.18_85)]'
    if (level.includes('2-')) return 'bg-[oklch(0.70_0.24_190)]'
    if (level.includes('3-')) return 'bg-[oklch(0.58_0.24_330)]'
    return 'bg-[oklch(0.65_0.15_155)]'
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-[98vw] sm:max-w-4xl h-[95vh] sm:max-h-[90vh] overflow-hidden bg-card border-4 border-[oklch(0.75_0.18_85)] flex flex-col p-3 sm:p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg sm:text-2xl pixel-font text-[oklch(0.75_0.18_85)] text-center">
            🎵 MARIO JUKEBOX 🎵
          </DialogTitle>
          <p className="text-center text-xs text-[oklch(0.85_0.02_280)]">Internet Archive playlist of Koji Kondo-era Mario tracks</p>
        </DialogHeader>

        <div className="flex flex-col gap-3 sm:gap-4 overflow-hidden flex-1">
          {showChat && (
            <Card className="p-3 sm:p-4 bg-gradient-to-br from-[oklch(0.70_0.24_190)] to-[oklch(0.65_0.15_155)] border-2 border-[oklch(0.75_0.18_85)] flex-shrink-0">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Robot size={20} className="sm:w-6 sm:h-6 text-white" weight="fill" />
                <h3 className="font-bold text-sm sm:text-lg text-white">AI Assistant</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(false)}
                  className="ml-auto text-white hover:text-[oklch(0.75_0.18_85)] h-8 px-2"
                >
                  Hide
                </Button>
              </div>

              <div className="bg-background/10 backdrop-blur rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 max-h-24 sm:max-h-32 overflow-y-auto">
                <div className="space-y-1 sm:space-y-2">
                  {chatMessages.slice(-5).map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-1.5 sm:p-2 rounded text-xs sm:text-sm ${
                        msg.role === 'user'
                          ? 'bg-white/20 text-white ml-4 sm:ml-6'
                          : msg.role === 'system'
                          ? 'bg-white/10 text-white/80 italic text-[10px] sm:text-xs'
                          : 'bg-white/30 text-white mr-4 sm:mr-6'
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isAIThinking && (
                    <div className="bg-white/30 p-1.5 sm:p-2 rounded mr-4 sm:mr-6">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask AI to control music..."
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/60 h-9 sm:h-10 text-sm"
                  disabled={isAIThinking}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isAIThinking || !inputMessage.trim()}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/40 h-9 w-9 sm:h-10 sm:w-10 p-0"
                >
                  <PaperPlaneTilt size={16} className="sm:w-5 sm:h-5" weight="fill" />
                </Button>
              </div>
            </Card>
          )}

          {!showChat && (
            <div className="flex justify-center flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(true)}
                className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 text-xs sm:text-sm"
              >
                <Robot size={16} className="sm:w-5 sm:h-5" weight="fill" />
                Show AI Assistant
              </Button>
            </div>
          )}

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-[oklch(0.58_0.24_330)] to-[oklch(0.70_0.24_190)] border-2 border-[oklch(0.75_0.18_85)] flex-shrink-0">
            <div className="text-center space-y-2 sm:space-y-4">
              <div className="text-3xl sm:text-5xl">🎮</div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-white pixel-font mb-1 sm:mb-2 leading-tight">
                  {currentSong.name}
                </h3>
                <div className={`inline-block px-2 sm:px-4 py-0.5 sm:py-1 rounded-lg ${getLevelColor(currentSong.level)} text-background font-bold text-xs sm:text-sm`}>
                  {currentSong.level}
                </div>
              </div>

              {clickSpeed === 'fast' && (
                <Badge className="bg-[oklch(0.58_0.24_330)] text-white text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1">
                  ⚡ Fast Mode Active
                </Badge>
              )}

              <div className="flex items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-6">
                <Button
                  size="lg"
                  onClick={handlePrevious}
                  className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 w-12 h-12 sm:w-14 sm:h-14 p-0"
                >
                  <SkipBack size={20} className="sm:w-6 sm:h-6" weight="fill" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={handlePlayPause}
                  className="bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] text-background border-4 border-[oklch(0.85_0.20_85)] w-14 h-14 sm:w-16 sm:h-16 shadow-lg p-0"
                >
                  {isPlaying ? (
                    <Pause size={24} className="sm:w-8 sm:h-8" weight="fill" />
                  ) : (
                    <Play size={24} className="sm:w-8 sm:h-8" weight="fill" />
                  )}
                </Button>

                <Button
                  size="lg"
                  onClick={handleNext}
                  className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 w-12 h-12 sm:w-14 sm:h-14 p-0"
                >
                  <SkipForward size={20} className="sm:w-6 sm:h-6" weight="fill" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4 bg-white/10 backdrop-blur rounded-lg py-2 sm:py-3 px-3 sm:px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 p-0"
                >
                  {isMuted ? (
                    <SpeakerSlash size={20} className="sm:w-6 sm:h-6" weight="fill" />
                  ) : (
                    <SpeakerHigh size={20} className="sm:w-6 sm:h-6" weight="fill" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 sm:w-32 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[oklch(0.75_0.18_85)]"
                />
                <span className="text-white font-bold min-w-[2.5rem] sm:min-w-[3rem] text-right text-xs sm:text-sm">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          </Card>

          <div className="space-y-2 sm:space-y-3 pb-2 overflow-y-auto flex-1 pr-1 sm:pr-2">
            <h4 className="font-bold text-sm sm:text-lg pixel-font text-[oklch(0.75_0.18_85)] sticky top-0 bg-card z-10 py-1">🎼 PLAYLIST</h4>
            
            {songs.map((song) => (
              <Card
                key={song.id}
                className={`p-2 sm:p-3 cursor-pointer transition-all hover:scale-[1.01] ${
                  currentSong.id === song.id
                    ? 'bg-[oklch(0.75_0.18_85)] text-background border-2 border-[oklch(0.80_0.20_85)] shadow-lg'
                    : 'bg-card hover:bg-muted border border-border'
                }`}
                onClick={() => handleSongSelect(song)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base truncate">{song.name}</div>
                    <div className={`text-[10px] sm:text-xs ${currentSong.id === song.id ? 'text-background/80' : 'text-muted-foreground'}`}>
                      {song.level}
                      {song.tempo === 'fast' && ' ⚡'}
                      {song.tempo === 'star' && ' ⭐'}
                    </div>
                  </div>
                  {currentSong.id === song.id && isPlaying && (
                    <div className="flex gap-0.5 sm:gap-1 items-end h-4 sm:h-5 flex-shrink-0">
                      <div className="w-0.5 sm:w-1 bg-background animate-pulse" style={{ animationDelay: '0ms', height: '60%' }}></div>
                      <div className="w-0.5 sm:w-1 bg-background animate-pulse" style={{ animationDelay: '150ms', height: '100%' }}></div>
                      <div className="w-0.5 sm:w-1 bg-background animate-pulse" style={{ animationDelay: '300ms', height: '80%' }}></div>
                      <div className="w-0.5 sm:w-1 bg-background animate-pulse" style={{ animationDelay: '450ms', height: '40%' }}></div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <audio
          ref={audioRef}
          src={currentSong.url}
          onEnded={handleSongEnd}
          loop={false}
          preload="auto"
          crossOrigin="anonymous"
          playsInline
        />
      </DialogContent>
    </Dialog>
  )
}
