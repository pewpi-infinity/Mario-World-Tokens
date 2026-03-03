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
  { id: '1', name: 'Main Theme', level: 'Level 1-1', url: 'https://ia600304.us.archive.org/33/items/TvtokmanPart1/Super%20Mario%20Bros.mp3', tempo: 'normal' },
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const lastClickTimeRef = useRef<number>(0)

  useEffect(() => {
    if (initialLevel) {
      const levelSong = MARIO_SONGS.find(s => s.level === initialLevel)
      if (levelSong) {
        setCurrentSong(levelSong)
      }
    }
  }, [initialLevel])

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

    audio.load()

    if (isPlaying && open) {
      audio.currentTime = 0
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🎵 Jukebox playing:', currentSong.name)
            toast.success('🎵 Now Playing', { description: currentSong.name })
          })
          .catch((error) => {
            console.error('❌ Jukebox play failed:', error.message)
            setIsPlaying(false)
            toast.error('Audio playback failed', { description: 'Click play to try again' })
          })
      }
    } else if (!open && audio) {
      audio.pause()
      setIsPlaying(false)
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
      const songList = MARIO_SONGS.map((s, i) => `${i + 1}. ${s.name} (${s.level})`).join('\n')
      return `🎼 Available songs:\n${songList}\n\nJust tell me which one to play!`
    }

    if (lower.includes('search') || lower.includes('info') || lower.includes('about')) {
      const prompt = window.spark.llmPrompt`Search the internet for information about: ${message}. Provide a concise, interesting response with any relevant links or facts.`
      
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
- Available songs: ${MARIO_SONGS.map(s => s.name).join(', ')}
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
    if (!audioRef.current) return
    trackUserAction(isPlaying ? 'pause' : 'play', currentSong.name)
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      toast.info('⏸️ Paused', { description: currentSong.name })
    } else {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.error('Play failed:', error)
            setIsPlaying(false)
            toast.error('Playback failed', { description: 'Please try again or select another song' })
          })
      }
    }
  }

  const handleNext = () => {
    const currentIndex = MARIO_SONGS.findIndex(s => s.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % MARIO_SONGS.length
    setCurrentSong(MARIO_SONGS[nextIndex])
    trackUserAction('next', MARIO_SONGS[nextIndex].name)
    if (open) {
      setIsPlaying(true)
    }
  }

  const handlePrevious = () => {
    const currentIndex = MARIO_SONGS.findIndex(s => s.id === currentSong.id)
    const prevIndex = currentIndex === 0 ? MARIO_SONGS.length - 1 : currentIndex - 1
    setCurrentSong(MARIO_SONGS[prevIndex])
    trackUserAction('previous', MARIO_SONGS[prevIndex].name)
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-card border-4 border-[oklch(0.75_0.18_85)]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl pixel-font text-[oklch(0.75_0.18_85)]">
              🎵 MARIO JUKEBOX 🎵
            </DialogTitle>
            <Button
              variant="ghost"
              onClick={() => setShowChat(!showChat)}
              className="flex items-center gap-2"
            >
              <Robot size={20} weight="fill" />
              {showChat ? 'Hide AI' : 'Show AI'}
            </Button>
          </div>
        </DialogHeader>

        <div className={`grid ${showChat ? 'grid-cols-2' : 'grid-cols-1'} gap-4 h-[600px]`}>
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-[oklch(0.58_0.24_330)] to-[oklch(0.70_0.24_190)] border-2 border-[oklch(0.75_0.18_85)]">
                <div className="text-center space-y-4">
                  <div className="text-4xl">🎮</div>
                  <h3 className="text-xl font-bold text-white pixel-font">
                    {currentSong.name}
                  </h3>
                  <div className={`inline-block px-4 py-2 rounded-lg ${getLevelColor(currentSong.level)} text-background font-bold`}>
                    {currentSong.level}
                  </div>

                  {clickSpeed === 'fast' && (
                    <Badge className="bg-[oklch(0.58_0.24_330)] text-white">
                      ⚡ Fast Mode Detected
                    </Badge>
                  )}

                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                      size="lg"
                      onClick={handlePrevious}
                      className="bg-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.75_0.26_195)]"
                    >
                      <SkipBack size={24} weight="fill" />
                    </Button>
                    
                    <Button
                      size="lg"
                      onClick={handlePlayPause}
                      className="bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] px-8"
                    >
                      {isPlaying ? (
                        <Pause size={32} weight="fill" />
                      ) : (
                        <Play size={32} weight="fill" />
                      )}
                    </Button>

                    <Button
                      size="lg"
                      onClick={handleNext}
                      className="bg-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.75_0.26_195)]"
                    >
                      <SkipForward size={24} weight="fill" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:text-[oklch(0.75_0.18_85)]"
                    >
                      {isMuted ? (
                        <SpeakerSlash size={24} />
                      ) : (
                        <SpeakerHigh size={24} />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-32"
                    />
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                <h4 className="font-bold text-lg pixel-font">🎼 Song Playlist</h4>
                
                {MARIO_SONGS.map((song) => (
                  <Card
                    key={song.id}
                    className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                      currentSong.id === song.id
                        ? 'bg-[oklch(0.75_0.18_85)] text-background border-2 border-[oklch(0.80_0.20_85)]'
                        : 'bg-card hover:bg-muted'
                    }`}
                    onClick={() => handleSongSelect(song)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-bold">{song.name}</div>
                        <div className={`text-sm ${currentSong.id === song.id ? 'text-background/80' : 'text-muted-foreground'}`}>
                          {song.level}
                        </div>
                      </div>
                      {currentSong.id === song.id && isPlaying && (
                        <div className="flex gap-1">
                          <div className="w-1 h-4 bg-background animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-4 bg-background animate-pulse" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 h-4 bg-background animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>

          {showChat && (
            <div className="flex flex-col h-full border-l-2 border-border pl-4">
              <div className="flex items-center gap-2 mb-4">
                <Robot size={24} weight="fill" className="text-[oklch(0.70_0.24_190)]" />
                <h3 className="font-bold text-lg">AI Jukebox Assistant</h3>
              </div>

              <ScrollArea className="flex-1 mb-4 pr-4">
                <div className="space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-[oklch(0.70_0.24_190)] text-white ml-8'
                          : msg.role === 'system'
                          ? 'bg-muted text-muted-foreground text-sm italic'
                          : 'bg-card border border-border mr-8'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                    </div>
                  ))}
                  {isAIThinking && (
                    <div className="bg-card border border-border p-3 rounded-lg mr-8">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-[oklch(0.70_0.24_190)] rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-[oklch(0.70_0.24_190)] rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[oklch(0.70_0.24_190)] rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask AI to control music, search info..."
                  className="flex-1"
                  disabled={isAIThinking}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isAIThinking || !inputMessage.trim()}
                  className="bg-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.75_0.26_195)]"
                >
                  <PaperPlaneTilt size={20} weight="fill" />
                </Button>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                💡 Try: "play star theme", "search for Koji Kondo", "next song", "volume up"
              </div>
            </div>
          )}
        </div>

        <audio
          ref={audioRef}
          src={currentSong.url}
          onEnded={handleSongEnd}
          loop={false}
          preload="auto"
          crossOrigin="anonymous"
        />
      </DialogContent>
    </Dialog>
  )
}
