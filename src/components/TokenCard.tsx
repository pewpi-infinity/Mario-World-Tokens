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
          'p-6 cursor-pointer border-2 shadow-md hover:shadow-lg transition-shadow currency-pattern relative overflow-hidden',
          selected && 'ring-2 ring-primary',
          getDenominationColor(token.denomination)
        )}
        onClick={onClick}
      >
        {isRare && (
          <div className="absolute top-2 right-2">
            <Sparkle className="text-accent" size={20} weight="fill" />
          </div>
        )}

        {hasSignificantValue && (
          <div className="absolute top-2 left-2">
            <Badge variant="default" className="bg-accent text-accent-foreground text-xs px-2 py-0.5">
              <TrendUp size={12} className="mr-1" weight="bold" />
              Valuable
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-3xl font-bold font-serif">
              ${token.denomination}
            </div>
            <Badge variant="outline" className="mt-1">
              Federal Reserve Note
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Serial Number</div>
            <div className="serial-number text-sm font-medium">
              {token.serialNumber}
            </div>
          </div>

          {noteValue && (
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Est. Value</span>
                <span className="text-sm font-bold text-accent">${noteValue.totalValue.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={12} />
            <span>{token.location}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            Minted {formatTimestamp(token.mintedAt)}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
