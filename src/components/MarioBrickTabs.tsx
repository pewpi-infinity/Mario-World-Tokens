import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MarioBrickTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { value: 'treasury', label: 'Treasury', emoji: '🟡' },
  { value: 'marketplace', label: 'Market', emoji: '🤑' },
  { value: 'charts', label: 'Charts', emoji: '📊' },
  { value: 'ledger', label: 'Ledger', emoji: '🌍' },
]

export function MarioBrickTabs({ activeTab, onTabChange }: MarioBrickTabsProps) {
  const [hitBrick, setHitBrick] = useState<number | null>(null)
  const [poppedEmoji, setPoppedEmoji] = useState<{ emoji: string; index: number } | null>(null)

  const handleBrickClick = (index: number) => {
    setHitBrick(index)
    setPoppedEmoji({ emoji: tabs[index].emoji, index })
    onTabChange(tabs[index].value)
    
    setTimeout(() => {
      setHitBrick(null)
      
      setTimeout(() => {
        setPoppedEmoji(null)
      }, 500)
    }, 300)
  }

  return (
    <div className="w-full overflow-x-auto px-2 sm:px-4 py-4">
      <div className="flex gap-3 sm:gap-4 justify-center min-w-max mx-auto">
        {tabs.map((tab, index) => (
          <div key={tab.value} className="relative flex flex-col items-center gap-2">
            <AnimatePresence>
              {poppedEmoji?.index === index && (
                <motion.div
                  initial={{ y: 0, opacity: 0, scale: 0 }}
                  animate={{ y: -50, opacity: 1, scale: 1.4 }}
                  exit={{ y: -80, opacity: 0, scale: 0.5 }}
                  className="absolute -top-14 text-4xl sm:text-5xl z-30"
                >
                  {poppedEmoji.emoji}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => handleBrickClick(index)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-all cursor-pointer ${
                activeTab === tab.value ? 'ring-4 ring-[oklch(0.75_0.18_85)]' : ''
              }`}
              style={{
                background: 'linear-gradient(135deg, oklch(0.75 0.18 85) 0%, oklch(0.65 0.15 85) 100%)',
                borderRadius: '6px',
                boxShadow: hitBrick === index 
                  ? '0 0 0 0, inset 0 -2px 0 oklch(0 0 0 / 0.3)' 
                  : '0 4px 0 oklch(0.55 0.12 85), 0 8px 20px oklch(0 0 0 / 0.4), inset 0 2px 0 oklch(1 0 0 / 0.2)',
                border: '3px solid oklch(0.85 0.20 85)',
              }}
              animate={{
                y: hitBrick === index ? 4 : 0,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0.5 rounded border-2 border-white/10"></div>
              <div className="absolute inset-0 rounded" style={{
                background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 8px, oklch(1 0 0 / 0.1) 8px, oklch(1 0 0 / 0.1) 9px)'
              }}></div>
              <span className="relative z-10 text-white drop-shadow-lg font-bold text-3xl sm:text-4xl">?</span>
            </motion.button>

            <span className="text-xs sm:text-sm font-bold text-foreground pixel-font whitespace-nowrap">
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
