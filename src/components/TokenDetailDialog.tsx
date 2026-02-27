import { MarioToken, Transaction } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Seal, Sparkle, User, ListNumbers } from '@phosphor-icons/react'
import { formatTimestamp, isRareSerial, getDenominationColor } from '@/lib/currency'

interface TokenDetailDialogProps {
  token: MarioToken | null
  transactions: Transaction[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TokenDetailDialog({ token, transactions, open, onOpenChange }: TokenDetailDialogProps) {
  if (!token) return null

  const tokenTransactions = transactions.filter(t => t.tokenId === token.id)
  const isRare = isRareSerial(token.serialNumber)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Token Details
            {isRare && (
              <Badge variant="default" className="bg-accent text-accent-foreground">
                <Sparkle size={14} className="mr-1" weight="fill" />
                Rare Serial
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className={`p-6 rounded-lg border-2 ${getDenominationColor(token.denomination)} currency-pattern`}>
            <div className="text-4xl font-bold font-serif mb-2">
              ${token.denomination}
            </div>
            <Badge variant="outline">Federal Reserve Note</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ListNumbers size={16} />
                Serial Number
              </div>
              <div className="serial-number font-medium">{token.serialNumber}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User size={16} />
                Current Owner
              </div>
              <div className="font-medium">{token.currentOwner}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Seal size={16} />
                Minted By
              </div>
              <div className="font-medium">{token.mintedBy}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={16} />
                Minting Location
              </div>
              <div className="font-medium">{token.location}</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Design Notes</div>
            <p className="text-sm">{token.designNotes}</p>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Minted At</div>
            <div className="text-sm font-medium">{formatTimestamp(token.mintedAt)}</div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-semibold">Transaction History</div>
            {tokenTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transfers yet</p>
            ) : (
              <div className="space-y-2">
                {tokenTransactions.map((tx) => (
                  <div key={tx.id} className="text-sm p-3 bg-muted rounded-md">
                    <div className="font-medium">
                      {tx.from} → {tx.to}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {formatTimestamp(tx.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
