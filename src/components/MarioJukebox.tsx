import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Pause, SkipForward, SkipBack, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Song {
  id: string
  name: string
  level: string
  url: string
}

const MARIO_SONGS: Song[] = [
  { id: '1', name: 'Main Theme', level: 'Level 1-1', url: 'https://ia800504.us.archive.org/33/items/TvtokmanPart1/Super%20Mario%20Bros.mp3' },
  { id: '2', name: 'Underground', level: 'Level 1-2', url: 'https://ia800208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/01%20Super%20Mario%20Bros.%20-%20Underground%20BGM.mp3' },
  { id: '3', name: 'Star Theme', level: 'Level 1-3', url: 'https://ia800208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/07%20Super%20Mario%20Bros.%20-%20Starman%20BGM.mp3' },
  { id: '4', name: 'Water World', level: 'Level 2-1', url: 'https://ia800208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/09%20Super%20Mario%20Bros.%20-%20Underwater%20BGM.mp3' },
  { id: '5', name: 'Castle', level: 'Level 2-2', url: 'https://ia800208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/03%20Super%20Mario%20Bros.%20-%20Castle%20BGM.mp3' },
  { id: '6', name: 'Hurry Up', level: 'Level 2-3', url: 'https://ia800208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/02%20Super%20Mario%20Bros.%20-%20Hurry%21.mp3' },
  { id: '7', name: 'Game Over', level: 'Level 3-1', url: 'https://ia800208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/05%20Super%20Mario%20Bros.%20-%20Game%20Over.mp3' },
  { id: '8', name: 'World Clear', level: 'Level 3-2', url: 'https://ia800208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/08%20Super%20Mario%20Bros.%20-%20World%20Clear%20Fanfare.mp3' },
  { id: '9', name: 'Ending', level: 'Level 3-3', url: 'https://ia800208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/04%20Super%20Mario%20Bros.%20-%20Ending.mp3' },
  { id: '10', name: 'Bonus Stage', level: 'Bonus', url: 'https://ia800208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/10%20Super%20Mario%20Bros.%202%20-%20Invincibility%20BGM.mp3' }
]

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
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (initialLevel) {
      const levelSong = MARIO_SONGS.find(s => s.level === initialLevel)
      if (levelSong) {
        setCurrentSong(levelSong)
      }
    }
  }, [initialLevel])

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
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Play failed:', error)
          setIsPlaying(false)
        })
      }
    }
  }, [currentSong, isPlaying, open])

  const handlePlayPause = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
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
          })
      }
    }
  }

  const handleNext = () => {
    const currentIndex = MARIO_SONGS.findIndex(s => s.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % MARIO_SONGS.length
    setCurrentSong(MARIO_SONGS[nextIndex])
    if (open) {
      setIsPlaying(true)
    }
  }

  const handlePrevious = () => {
    const currentIndex = MARIO_SONGS.findIndex(s => s.id === currentSong.id)
    const prevIndex = currentIndex === 0 ? MARIO_SONGS.length - 1 : currentIndex - 1
    setCurrentSong(MARIO_SONGS[prevIndex])
    if (open) {
      setIsPlaying(true)
    }
  }

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song)
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
      <DialogContent className="max-w-2xl max-h-[90vh] bg-card border-4 border-[oklch(0.75_0.18_85)]">
        <DialogHeader>
          <DialogTitle className="text-2xl pixel-font text-[oklch(0.75_0.18_85)]">
            🎵 MARIO JUKEBOX 🎵
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
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

        <audio
          ref={audioRef}
          src={currentSong.url}
          onEnded={handleSongEnd}
          loop={false}
          preload="auto"
        />
      </DialogContent>
    </Dialog>
  )
}
