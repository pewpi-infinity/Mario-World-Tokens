import { MarioToken } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkle, MapPin, TrendUp } from '@phosphor-icons/react'
import { getDenominationColor, isRareSerial, formatTimestamp, calculateNoteValue } from '@/lib/currency'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TokenCardProps {
  token: MarioToken
  onClick?: () => void
  selected?: boolean
}

export function TokenCard({ token, onClick, selected }: TokenCardProps) {
  const isRare = isRareSerial(token.serialNumber)
  const noteValue = token.provenance ? calculateNoteValue(token) : null
  const hasSignificantValue = noteValue && noteValue.collectibleValue > token.denomination * 0.2

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className={cn(
          'p-6 cursor-pointer border-3 shadow-lg hover:shadow-xl transition-all currency-pattern relative overflow-hidden',
          selected && 'ring-4 ring-accent shadow-accent/50',
          getDenominationColor(token.denomination)
        )}
        onClick={onClick}
      >
        {isRare && (
          <motion.div
            className="absolute top-2 right-2"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkle className="text-accent drop-shadow-lg" size={24} weight="fill" />
          </motion.div>
        )}

        {hasSignificantValue && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-accent text-accent-foreground text-xs px-2 py-1 shadow-lg border-2 border-accent-foreground/20">
              <TrendUp size={14} className="mr-1" weight="bold" />
              Valuable
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div>
            <motion.div
              className="text-4xl font-bold font-serif drop-shadow-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              ${token.denomination}
            </motion.div>
            <Badge variant="outline" className="mt-2 border-current/30 backdrop-blur-sm">
              Federal Reserve Note
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Serial Number</div>
            <div className="serial-number text-sm font-bold mt-1">
              {token.serialNumber}
            </div>
          </div>

          {noteValue && (
            <div className="pt-2 border-t border-current/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold opacity-80">Est. Value</span>
                <span className="text-base font-bold">${noteValue.totalValue.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs opacity-80 font-medium">
            <MapPin size={14} weight="fill" />
            <span>{token.location}</span>
          </div>

          <div className="text-xs opacity-75">
            Minted {formatTimestamp(token.mintedAt)}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
