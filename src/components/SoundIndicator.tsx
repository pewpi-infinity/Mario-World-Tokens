import { useEffect, useState } from 'react'
import { SpeakerHigh, SpeakerSlash, MusicNotes } from '@phosphor-icons/react'

interface SoundIndicatorProps {
  className?: string
}

export function SoundIndicator({ className = '' }: SoundIndicatorProps) {
  const [isSoundPlaying, setIsSoundPlaying] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [recentSound, setRecentSound] = useState<string>('')
  const [audioLevel, setAudioLevel] = useState(0)

  useEffect(() => {
    const checkAudioActivity = () => {
      const allAudios = Array.from(document.querySelectorAll('audio'))
      
      let hasActiveSound = false
      let hasActiveMusic = false
      let maxVolume = 0

      allAudios.forEach(audio => {
        if (!audio.paused && audio.currentTime > 0 && !audio.ended) {
          const isMusic = audio.duration > 30 || audio.loop
          
          if (isMusic) {
            hasActiveMusic = true
          } else {
            hasActiveSound = true
          }
          
          maxVolume = Math.max(maxVolume, audio.volume)
        }
      })

      setIsSoundPlaying(hasActiveSound)
      setIsMusicPlaying(hasActiveMusic)
      setAudioLevel(maxVolume)
    }

    const interval = setInterval(checkAudioActivity, 100)
    
    const handlePlay = (e: Event) => {
      const audio = e.target as HTMLAudioElement
      const soundName = audio.src.split('/').pop()?.split('.')[0] || 'Sound'
      setRecentSound(soundName)
      setTimeout(() => setRecentSound(''), 2000)
    }

    document.addEventListener('play', handlePlay, true)

    return () => {
      clearInterval(interval)
      document.removeEventListener('play', handlePlay, true)
    }
  }, [])

  const isActive = isSoundPlaying || isMusicPlaying

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-md
          border-2 transition-all duration-300 shadow-lg
          ${isActive 
            ? 'bg-[oklch(0.75_0.18_85_/_0.95)] border-[oklch(0.85_0.20_85)] scale-100' 
            : 'bg-[oklch(0.28_0.04_285_/_0.8)] border-[oklch(0.35_0.05_285)] scale-90 opacity-60'
          }
        `}
      >
        <div className="flex items-center gap-2">
          {isMusicPlaying && (
            <div className="flex items-center gap-1.5">
              <MusicNotes 
                size={24} 
                weight="fill"
                className={`${isActive ? 'text-[oklch(0.15_0.02_280)]' : 'text-muted-foreground'}`}
              />
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      isActive ? 'bg-[oklch(0.15_0.02_280)]' : 'bg-muted-foreground'
                    }`}
                    style={{
                      height: `${8 + Math.sin(Date.now() / 100 + i * 0.5) * 8}px`,
                      animation: isMusicPlaying ? `musicBar 0.${3 + i}s ease-in-out infinite` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {isSoundPlaying && !isMusicPlaying && (
            <div className="flex items-center gap-2">
              <SpeakerHigh 
                size={24} 
                weight="fill"
                className={`${isActive ? 'text-[oklch(0.15_0.02_280)]' : 'text-muted-foreground'}`}
              />
              <div className="flex gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all ${
                      isActive ? 'bg-[oklch(0.15_0.02_280)]' : 'bg-muted-foreground'
                    }`}
                    style={{
                      height: `${12 + (audioLevel * 20)}px`,
                      animation: 'soundPulse 0.3s ease-in-out'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {!isActive && (
            <SpeakerSlash 
              size={24} 
              weight="fill"
              className="text-muted-foreground"
            />
          )}
        </div>

        <div className="flex flex-col items-start min-w-[100px]">
          <span className={`text-xs font-bold ${isActive ? 'text-[oklch(0.15_0.02_280)]' : 'text-muted-foreground'}`}>
            {isMusicPlaying ? '♪ MUSIC' : isSoundPlaying ? '🔊 SFX' : 'SILENT'}
          </span>
          {recentSound && (
            <span className="text-[10px] text-[oklch(0.15_0.02_280)] font-semibold truncate max-w-[100px]">
              {recentSound}
            </span>
          )}
        </div>

        {isActive && (
          <div className="absolute -inset-1 bg-[oklch(0.75_0.18_85_/_0.3)] rounded-lg blur-md -z-10 animate-pulse" />
        )}
      </div>

      <style>{`
        @keyframes musicBar {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
        
        @keyframes soundPulse {
          0% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
