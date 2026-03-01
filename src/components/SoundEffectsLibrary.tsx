import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SpeakerHigh, Download } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SoundEffect {
  id: string
  name: string
  emoji: string
  category: string
  frequency?: number
  type?: OscillatorType
  duration?: number
}

const SOUND_EFFECTS: SoundEffect[] = [
  { id: 'coin', name: 'Mario Coin', emoji: '🪙', category: 'mario', frequency: 1000, type: 'square', duration: 0.1 },
  { id: 'jump', name: 'Jump', emoji: '⬆️', category: 'mario', frequency: 600, type: 'square', duration: 0.15 },
  { id: 'powerup', name: 'Power Up', emoji: '🍄', category: 'mario', frequency: 523, type: 'square', duration: 0.5 },
  { id: 'pipe', name: 'Pipe', emoji: '🟢', category: 'mario', frequency: 392, type: 'sine', duration: 0.3 },
  { id: '1up', name: '1-UP', emoji: '⭐', category: 'mario', frequency: 880, type: 'square', duration: 0.4 },
  { id: 'stomp', name: 'Enemy Stomp', emoji: '👞', category: 'mario', frequency: 200, type: 'sawtooth', duration: 0.1 },
  { id: 'fireball', name: 'Fireball', emoji: '🔥', category: 'mario', frequency: 800, type: 'triangle', duration: 0.2 },
  { id: 'star', name: 'Star Power', emoji: '🌟', category: 'mario', frequency: 1200, type: 'square', duration: 0.3 },
  
  { id: 'beep', name: 'Beep', emoji: '📟', category: 'retro', frequency: 440, type: 'sine', duration: 0.1 },
  { id: 'bloop', name: 'Bloop', emoji: '💧', category: 'retro', frequency: 220, type: 'sine', duration: 0.15 },
  { id: 'laser', name: 'Laser', emoji: '🔫', category: 'retro', frequency: 2000, type: 'sawtooth', duration: 0.2 },
  { id: 'explosion', name: 'Explosion', emoji: '💥', category: 'retro', frequency: 100, type: 'sawtooth', duration: 0.3 },
  { id: 'pickup', name: 'Item Pickup', emoji: '📦', category: 'retro', frequency: 800, type: 'triangle', duration: 0.15 },
  { id: 'select', name: 'Menu Select', emoji: '📋', category: 'retro', frequency: 660, type: 'square', duration: 0.08 },
  { id: 'error', name: 'Error', emoji: '❌', category: 'retro', frequency: 150, type: 'sawtooth', duration: 0.25 },
  { id: 'success', name: 'Success', emoji: '✅', category: 'retro', frequency: 1000, type: 'sine', duration: 0.3 },
  
  { id: 'blip', name: 'Blip', emoji: '🎯', category: 'ui', frequency: 523, type: 'sine', duration: 0.05 },
  { id: 'click', name: 'Click', emoji: '🖱️', category: 'ui', frequency: 880, type: 'square', duration: 0.03 },
  { id: 'whoosh', name: 'Whoosh', emoji: '💨', category: 'ui', frequency: 300, type: 'sine', duration: 0.2 },
  { id: 'ding', name: 'Ding', emoji: '🔔', category: 'ui', frequency: 2000, type: 'sine', duration: 0.15 }
]

const categories = ['all', 'mario', 'retro', 'ui']

interface SoundEffectsLibraryProps {
  onSelectSound?: (soundId: string) => void
}

export function SoundEffectsLibrary({ onSelectSound }: SoundEffectsLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [playing, setPlaying] = useState<string | null>(null)

  const playSound = (sound: SoundEffect) => {
    try {
      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = sound.type || 'sine'
      oscillator.frequency.setValueAtTime(sound.frequency || 440, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (sound.duration || 0.2))

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + (sound.duration || 0.2))

      setPlaying(sound.id)
      setTimeout(() => setPlaying(null), (sound.duration || 0.2) * 1000)

      if (onSelectSound) {
        onSelectSound(sound.id)
      }

    } catch (error) {
      console.error('Sound play error:', error)
      toast.error('Could not play sound')
    }
  }

  const downloadSound = async (sound: SoundEffect) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const duration = sound.duration || 0.2
      const sampleRate = audioContext.sampleRate
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate
        const frequency = sound.frequency || 440
        let value = 0

        if (sound.type === 'sine') {
          value = Math.sin(2 * Math.PI * frequency * t)
        } else if (sound.type === 'square') {
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
        } else if (sound.type === 'sawtooth') {
          value = 2 * ((frequency * t) % 1) - 1
        } else if (sound.type === 'triangle') {
          value = 2 * Math.abs(2 * ((frequency * t) % 1) - 1) - 1
        }

        const envelope = Math.exp(-3 * t / duration)
        data[i] = value * envelope * 0.3
      }

      const wav = audioBufferToWav(buffer)
      const blob = new Blob([wav], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${sound.id}-sound.wav`
      link.click()
      URL.revokeObjectURL(url)

      toast.success(`Downloaded ${sound.name}!`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Could not download sound')
    }
  }

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44
    const arrayBuffer = new ArrayBuffer(length)
    const view = new DataView(arrayBuffer)
    const channels: Float32Array[] = []
    let offset = 0
    let pos = 0

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true)
      pos += 2
    }

    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true)
      pos += 4
    }

    setUint32(0x46464952)
    setUint32(length - 8)
    setUint32(0x45564157)
    setUint32(0x20746d66)
    setUint32(16)
    setUint16(1)
    setUint16(buffer.numberOfChannels)
    setUint32(buffer.sampleRate)
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels)
    setUint16(buffer.numberOfChannels * 2)
    setUint16(16)
    setUint32(0x61746164)
    setUint32(length - pos - 4)

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][offset]))
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
        pos += 2
      }
      offset++
    }

    return arrayBuffer
  }

  const filteredSounds = selectedCategory === 'all'
    ? SOUND_EFFECTS
    : SOUND_EFFECTS.filter(s => s.category === selectedCategory)

  return (
    <Card className="bg-gradient-to-br from-[oklch(0.58_0.24_330)] to-[oklch(0.70_0.24_190)] border-2 border-[oklch(0.75_0.18_85)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white pixel-font text-sm">
          <SpeakerHigh size={20} weight="fill" className="text-[oklch(0.75_0.18_85)]" />
          SOUND EFFECTS LIBRARY
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat 
                ? 'bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.85_0.20_85)]' 
                : 'bg-white text-[oklch(0.15_0.02_280)] border-[oklch(0.75_0.18_85)]'}
            >
              {cat.toUpperCase()}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-2 gap-2">
            {filteredSounds.map((sound) => (
              <Card
                key={sound.id}
                className={`p-3 cursor-pointer transition-all ${
                  playing === sound.id
                    ? 'bg-[oklch(0.75_0.18_85)] scale-95'
                    : 'bg-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.22_0.03_285)]'
                } border-2 border-[oklch(0.75_0.18_85)]`}
              >
                <div onClick={() => playSound(sound)} className="text-center">
                  <div className="text-3xl mb-1">{sound.emoji}</div>
                  <div className="text-xs text-white font-semibold truncate">{sound.name}</div>
                  <div className="text-[10px] text-[oklch(0.75_0.18_85)] mt-1">
                    {sound.frequency}Hz
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadSound(sound)
                  }}
                  className="w-full mt-2 text-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.75_0.18_85)] hover:text-[oklch(0.15_0.02_280)]"
                >
                  <Download size={14} className="mr-1" />
                  <span className="text-xs">Save</span>
                </Button>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="text-xs text-center text-white/70 pt-2 border-t border-white/20">
          Click to play • Download for use in your tokens!
        </div>
      </CardContent>
    </Card>
  )
}
