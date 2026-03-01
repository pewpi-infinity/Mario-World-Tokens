import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MarioChartCharacterProps {
  character: 'mario' | 'luigi'
  message: string
  position?: 'left' | 'right'
}

export function MarioChartCharacter({ character, message, position = 'left' }: MarioChartCharacterProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const isMario = character === 'mario'
  
  return (
    <motion.div
      initial={{ x: position === 'left' ? -100 : 100, opacity: 0 }}
      animate={{ x: 0, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`flex items-end gap-3 ${position === 'right' ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg ${
          isMario 
            ? 'bg-gradient-to-br from-[oklch(0.65_0.25_25)] to-[oklch(0.55_0.25_25)]' 
            : 'bg-gradient-to-br from-[oklch(0.55_0.20_145)] to-[oklch(0.45_0.20_145)]'
        }`}>
          {isMario ? '🔴' : '🟢'}
        </div>
        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${
          isMario ? 'bg-[oklch(0.65_0.25_25)]' : 'bg-[oklch(0.55_0.20_145)]'
        } flex items-center justify-center text-white text-xs font-bold border-2 border-white`}>
          {isMario ? 'M' : 'L'}
        </div>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className={`px-4 py-3 rounded-2xl max-w-xs shadow-lg ${
          isMario
            ? 'bg-gradient-to-br from-[oklch(0.65_0.25_25)] to-[oklch(0.55_0.25_25)]'
            : 'bg-gradient-to-br from-[oklch(0.55_0.20_145)] to-[oklch(0.45_0.20_145)]'
        } text-white relative`}
      >
        <div className={`absolute ${position === 'left' ? '-left-2' : '-right-2'} bottom-4 w-4 h-4 rotate-45 ${
          isMario
            ? 'bg-gradient-to-br from-[oklch(0.65_0.25_25)] to-[oklch(0.55_0.25_25)]'
            : 'bg-gradient-to-br from-[oklch(0.55_0.20_145)] to-[oklch(0.45_0.20_145)]'
        }`} />
        <p className="text-sm font-medium relative z-10">{message}</p>
      </motion.div>
    </motion.div>
  )
}
