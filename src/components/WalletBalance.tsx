import { MarioToken } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins } from '@phosphor-icons/react'
import { formatCurrency, calculateWalletTotal, groupTokensByDenomination } from '@/lib/currency'
import { motion } from 'framer-motion'

interface WalletBalanceProps {
  tokens: MarioToken[]
}

export function WalletBalance({ tokens }: WalletBalanceProps) {
  const total = calculateWalletTotal(tokens)
  const breakdown = groupTokensByDenomination(tokens)

  return (
    <Card className="border-2 border-accent/30 shadow-lg bg-gradient-to-br from-card to-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Coins size={28} className="text-accent" weight="fill" />
          </motion.div>
          <span className="text-foreground">Wallet Balance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-5xl font-bold font-serif text-accent mb-6 drop-shadow-lg"
        >
          {formatCurrency(total)}
        </motion.div>
        
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(breakdown).map(([denomination, count]) => (
            count > 0 && (
              <Badge key={denomination} className="justify-center py-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                ${denomination} × {count}
              </Badge>
            )
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground font-medium">
          🪙 {tokens.length} {tokens.length === 1 ? 'note' : 'notes'} in wallet
        </div>
      </CardContent>
    </Card>
  )
}
