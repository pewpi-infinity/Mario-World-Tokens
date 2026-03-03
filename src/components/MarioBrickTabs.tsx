import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, TrendUp, Globe, Storefront } from '@phosphor-icons/react'

interface MarioBrickTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { value: 'treasury', icon: Coins, label: 'Treasury', emoji: '🟡', brick: '🧱' },
  { value: 'marketplace', icon: Storefront, label: 'Market', emoji: '🤑', brick: '🧱' },
  { value: 'charts', icon: TrendUp, label: 'Charts', emoji: '📊', brick: '🧱' },
  { value: 'ledger', icon: Globe, label: 'Ledger', emoji: '🌍', brick: '?' },
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
    <div className="relative w-full max-w-4xl mx-auto py-8 sm:py-12">
      <div className="relative h-32 sm:h-40">
        <div className="absolute bottom-12 sm:bottom-16 left-0 right-0 flex justify-around items-end px-4">
          {tabs.map((tab, index) => (
            <div key={tab.value} className="relative flex flex-col items-center gap-2">
              <AnimatePresence>
                {poppedEmoji?.index === index && (
                  <motion.div
                    initial={{ y: 0, opacity: 0, scale: 0 }}
                    animate={{ y: -60, opacity: 1, scale: 1.5 }}
                    exit={{ y: -100, opacity: 0, scale: 0.5 }}
                    className="absolute -top-16 text-4xl sm:text-6xl z-30"
                  >
                    {poppedEmoji.emoji}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => handleBrickClick(index)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-2xl sm:text-3xl transition-all cursor-pointer ${
                  activeTab === tab.value ? 'ring-4 ring-[oklch(0.75_0.18_85)]' : ''
                }`}
                style={{
                  background: tab.brick === '?' 
                    ? 'linear-gradient(135deg, oklch(0.75 0.18 85) 0%, oklch(0.65 0.15 85) 100%)'
                    : 'linear-gradient(135deg, oklch(0.58 0.24 30) 0%, oklch(0.48 0.20 30) 100%)',
                  borderRadius: '6px',
                  boxShadow: hitBrick === index 
                    ? '0 0 0 0, inset 0 -2px 0 oklch(0 0 0 / 0.3)' 
                    : `0 4px 0 oklch(0.38 0.18 30), 0 8px 20px oklch(0 0 0 / 0.4), inset 0 2px 0 oklch(1 0 0 / 0.2)`,
                  border: tab.brick === '?' ? '3px solid oklch(0.85 0.20 85)' : '3px solid oklch(0.48 0.20 30)',
                }}
                animate={{
                  y: hitBrick === index ? 4 : 0,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0.5 rounded border-2 border-white/10"></div>
                <div className="absolute inset-0 rounded" style={{
                  background: tab.brick === '?' 
                    ? 'repeating-linear-gradient(90deg, transparent 0px, transparent 8px, oklch(1 0 0 / 0.1) 8px, oklch(1 0 0 / 0.1) 9px)'
                    : 'repeating-linear-gradient(90deg, transparent 0px, transparent 7px, oklch(0 0 0 / 0.15) 7px, oklch(0 0 0 / 0.15) 8px), repeating-linear-gradient(0deg, transparent 0px, transparent 7px, oklch(0 0 0 / 0.15) 7px, oklch(0 0 0 / 0.15) 8px)'
                }}></div>
                <div className="relative z-10 flex flex-col items-center gap-1">
                  {tab.brick === '?' ? (
                    <span className="text-3xl sm:text-4xl text-white drop-shadow-lg font-bold">?</span>
                  ) : (
                    <tab.icon size={24} weight="fill" className="text-white drop-shadow-lg" />
                  )}
                </div>
              </motion.button>

              <span className="text-xs sm:text-sm font-bold text-foreground pixel-font">
                {tab.label}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[oklch(0.30_0.04_285)] via-[oklch(0.35_0.05_285)] to-[oklch(0.30_0.04_285)] rounded-full"></div>
      </div>
    </div>
  )
}
