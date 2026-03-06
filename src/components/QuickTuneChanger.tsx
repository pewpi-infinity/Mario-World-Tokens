import { useState } from 'react'
import { motion } from 'framer-motion'
// jukebox handles music

interface QuickTuneChangerProps { activeTab: string }

const tunes = [
  { emoji: '\u{1F7E1}', page: 'main', label: 'Overworld' },
  { emoji: '\u2B50', page: 'star', label: 'Star' },
  { emoji: '\u{1F573}', page: 'marketplace', label: 'Underground' },
  { emoji: '\u{1F3F0}', page: 'charts', label: 'Castle' },
  { emoji: '\u{1F30A}', page: 'ledger', label: 'Underwater' },
  { emoji: '\u{1F47B}', page: 'ghost', label: 'Ghost' },
  { emoji: '\u{1F30B}', page: 'fortress', label: 'Fortress' },
]

export function QuickTuneChanger({ activeTab }: QuickTuneChangerProps) {
  const [activeEmoji, setActiveEmoji] = useState<string | null>(null)
  const handleTuneClick = (page: string, emoji: string) => {
    setActiveEmoji(emoji); // jukebox handles music
    setTimeout(() => setActiveEmoji(null), 300)
  }
  return (
    <div className="w-full overflow-x-auto px-2 sm:px-4 py-2">
      <div className="flex gap-2 justify-center min-w-max mx-auto">
        {tunes.map((tune, idx) => (
          <motion.button key={idx} onClick={() => handleTuneClick(tune.page, tune.emoji)}
            className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all cursor-pointer overflow-hidden rounded"
            style={{
              background: activeEmoji === tune.emoji ? 'oklch(0.48 0.12 40)' : 'linear-gradient(135deg, oklch(0.60 0.15 47) 0%, oklch(0.55 0.13 45) 100%)',
              boxShadow: activeEmoji === tune.emoji ? 'inset 0 2px 4px oklch(0 0 0 / 0.5)' : '0 3px 0 oklch(0.45 0.12 40)',
            }}
            animate={{ y: activeEmoji === tune.emoji ? 3 : 0 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <span className="text-xl sm:text-2xl">{tune.emoji}</span>
          </motion.button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2 pixel-font">Theme Changer</p>
    </div>
  )
}
