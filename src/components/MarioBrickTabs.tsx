import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, TrendUp, Globe, Storefront } from '@phosphor-icons/react'

interface MarioBrickTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { value: 'treasury', icon: Coins, label: 'Treasury', emoji: '🟡', color: 'oklch(0.75 0.18 85)' },
  { value: 'marketplace', icon: Storefront, label: 'Market', emoji: '🤑', color: 'oklch(0.65 0.15 155)' },
  { value: 'charts', icon: TrendUp, label: 'Charts', emoji: '📊', color: 'oklch(0.70 0.24 190)' },
  { value: 'ledger', icon: Globe, label: 'Ledger', emoji: '🌍', color: 'oklch(0.58 0.24 330)' },
]

export function MarioBrickTabs({ activeTab, onTabChange }: MarioBrickTabsProps) {
  const [marioPosition, setMarioPosition] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [hitBrick, setHitBrick] = useState<number | null>(null)
  const [poppedEmoji, setPoppedEmoji] = useState<{ emoji: string; index: number } | null>(null)
  const [marioDirection, setMarioDirection] = useState<'right' | 'left'>('right')
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setMarioPosition((prev) => {
        if (marioDirection === 'right') {
          if (prev >= 3) {
            setMarioDirection('left')
            return 3
          }
          return prev + 1
        } else {
          if (prev <= 0) {
            setMarioDirection('right')
            return 0
          }
          return prev - 1
        }
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [marioDirection, isRunning])

  const handleBrickClick = (index: number) => {
    if (isJumping) return
    
    setIsRunning(false)
    setMarioPosition(index)
    
    setTimeout(() => {
      setIsJumping(true)
      setHitBrick(index)
      setPoppedEmoji({ emoji: tabs[index].emoji, index })
      onTabChange(tabs[index].value)
      
      setTimeout(() => {
        setIsJumping(false)
        setHitBrick(null)
        
        setTimeout(() => {
          setPoppedEmoji(null)
          setIsRunning(true)
        }, 1000)
      }, 500)
    }, 200)
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
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-md flex items-center justify-center text-2xl sm:text-3xl transition-all cursor-pointer ${
                  activeTab === tab.value ? 'ring-4 ring-white' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, ${tab.color} 0%, oklch(0.35 0.05 285) 100%)`,
                  boxShadow: hitBrick === index 
                    ? '0 0 0 0' 
                    : `0 4px 0 oklch(0.20 0.03 285), 0 8px 20px oklch(0 0 0 / 0.4)`,
                }}
                animate={{
                  y: hitBrick === index ? -4 : 0,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-1 border-2 border-white/20 rounded"></div>
                <div className="relative z-10 flex flex-col items-center gap-1">
                  {index === 1 ? (
                    <span className="text-3xl sm:text-4xl">?</span>
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

        <motion.div
          className="absolute bottom-0 left-0 z-20 text-5xl sm:text-7xl"
          animate={{
            x: `${(marioPosition / 3) * 100}%`,
            y: isJumping ? -80 : 0,
            scaleX: marioDirection === 'left' ? -1 : 1,
          }}
          transition={{
            x: { duration: 0.8, ease: 'easeInOut' },
            y: { duration: 0.3, ease: 'easeOut' },
          }}
          style={{
            transformOrigin: 'center',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          }}
        >
          <div className="relative flex items-center justify-center w-16 sm:w-20">
            {isJumping ? '🏃' : '🏃‍♂️'}
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[oklch(0.30_0.04_285)] via-[oklch(0.35_0.05_285)] to-[oklch(0.30_0.04_285)] rounded-full"></div>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          {isRunning ? '⏸️ Pause Mario' : '▶️ Run Mario'}
        </button>
      </div>
    </div>
  )
}
