import { MarioToken } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkle, MapPin } from '@phosphor-icons/react'
import { getDenominationColor, isRareSerial, formatTimestamp } from '@/lib/currency'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TokenCardProps {
  token: MarioToken
  onClick?: () => void
  selected?: boolean
}

export function TokenCard({ token, onClick, selected }: TokenCardProps) {
  const isRare = isRareSerial(token.serialNumber)

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
