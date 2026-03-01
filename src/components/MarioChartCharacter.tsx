import { motion } from 'framer-motion'

interface MarioChartCharacterProps {
  marioLogo: string
  position: { x: number; y: number }
}

export function MarioChartCharacter({ marioLogo, position }: MarioChartCharacterProps) {
  return (
    <motion.div
      className="absolute pointer-events-none z-10"
      initial={{ x: 0, y: position.y }}
      animate={{ x: position.x - 20, y: position.y }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <motion.img
        src={marioLogo}
        alt="Mario"
        className="w-12 h-12 object-contain drop-shadow-lg"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
