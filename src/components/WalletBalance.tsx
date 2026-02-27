import { MarioToken } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins } from '@phosphor-icons/react'
import { formatCurrency, calculateWalletTotal, groupTokensByDenomination } from '@/lib/currency'

interface WalletBalanceProps {
  tokens: MarioToken[]
}

export function WalletBalance({ tokens }: WalletBalanceProps) {
  const total = calculateWalletTotal(tokens)
  const breakdown = groupTokensByDenomination(tokens)

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins size={24} className="text-primary" weight="fill" />
          Wallet Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold font-serif text-primary mb-4">
          {formatCurrency(total)}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(breakdown).map(([denomination, count]) => (
            count > 0 && (
              <Badge key={denomination} variant="secondary" className="justify-center py-2">
                ${denomination} × {count}
              </Badge>
            )
          ))}
        </div>

        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
          {tokens.length} {tokens.length === 1 ? 'note' : 'notes'} in wallet
        </div>
      </CardContent>
    </Card>
  )
}
