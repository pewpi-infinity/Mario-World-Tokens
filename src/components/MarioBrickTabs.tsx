import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playBump } from '@/lib/sounds'

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
    playBump()
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
              className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-all cursor-pointer overflow-hidden ${
                activeTab === tab.value ? 'ring-4 ring-[oklch(0.75_0.18_85)]' : ''
              }`}
              style={{
                background: hitBrick === index 
                  ? 'oklch(0.48 0.12 40)'
                  : 'linear-gradient(135deg, oklch(0.60 0.15 47) 0%, oklch(0.55 0.13 45) 100%)',
                borderRadius: '4px',
                boxShadow: hitBrick === index 
                  ? 'inset 0 2px 4px oklch(0 0 0 / 0.5)' 
                  : '0 5px 0 oklch(0.45 0.12 40), inset 0 -2px 0 oklch(0.40 0.10 38), inset 0 2px 0 oklch(0.70 0.17 50)',
              }}
              animate={{
                y: hitBrick === index ? 5 : 0,
              }}
              whileHover={{ 
                scale: 1.05,
                background: 'oklch(0.65 0.17 48)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0" style={{
                background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 4px, oklch(0 0 0 / 0.1) 4px, oklch(0 0 0 / 0.1) 5px), repeating-linear-gradient(90deg, transparent 0px, transparent 4px, oklch(0 0 0 / 0.1) 4px, oklch(0 0 0 / 0.1) 5px)',
                pointerEvents: 'none'
              }}></div>
              <span className="relative z-10 text-3xl sm:text-4xl">🧱</span>
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
