import { MarioToken, Transaction } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Seal, Sparkle, User, ListNumbers, ArrowRight, Clock, Printer } from '@phosphor-icons/react'
import { formatTimestamp, isRareSerial, getDenominationColor } from '@/lib/currency'

interface TokenDetailDialogProps {
  token: MarioToken | null
  transactions: Transaction[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TokenDetailDialog({ token, transactions, open, onOpenChange }: TokenDetailDialogProps) {
  if (!token) return null

  const tokenTransactions = transactions
    .filter(t => t.tokenId === token.id)
    .sort((a, b) => b.timestamp - a.timestamp)
  
  const isRare = isRareSerial(token.serialNumber)
  const transferCount = tokenTransactions.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
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

        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              History
              {transferCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {transferCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-auto mt-4">
            <ScrollArea className="h-[500px] pr-4">
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
                    <div className="serial-number font-medium text-sm break-all">{token.serialNumber}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User size={16} />
                      Current Owner
                    </div>
                    <div className="font-medium text-sm break-all">{token.currentOwner}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Seal size={16} />
                      Minted By
                    </div>
                    <div className="font-medium text-sm break-all">{token.mintedBy}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin size={16} />
                      Minting Location
                    </div>
                    <div className="font-medium text-sm">{token.location}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Design Notes</div>
                  <p className="text-sm bg-muted p-3 rounded-md">{token.designNotes}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={16} />
                    Minted At
                  </div>
                  <div className="text-sm font-medium">{formatTimestamp(token.mintedAt)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Total Transfers</div>
                    <div className="text-2xl font-bold font-serif">{transferCount}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Age</div>
                    <div className="text-2xl font-bold font-serif">
                      {Math.floor((Date.now() - token.mintedAt) / (1000 * 60 * 60 * 24))}d
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Printer size={20} className="text-primary-foreground" weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">Minted</span>
                      <Badge variant="outline" className="text-xs">Origin</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Created by <span className="font-medium text-foreground break-all">{token.mintedBy}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimestamp(token.mintedAt)}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin size={12} />
                      {token.location}
                    </div>
                  </div>
                </div>

                {tokenTransactions.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-muted rounded-lg">
                    <ArrowRight size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No transfers yet</p>
                    <p className="text-xs text-muted-foreground mt-1">This token is still with its original minter</p>
                  </div>
                ) : (
                  <div className="space-y-4 border-l-2 border-border pl-6 ml-5">
                    {tokenTransactions.map((tx, index) => (
                      <div key={tx.id} className="relative">
                        <div className="absolute -left-[29px] top-2 w-4 h-4 rounded-full bg-secondary border-2 border-background" />
                        <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">Transfer #{tokenTransactions.length - index}</span>
                              {index === 0 && (
                                <Badge variant="default" className="text-xs">Latest</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm mb-3">
                            <span className="font-medium break-all">{tx.from}</span>
                            <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" weight="bold" />
                            <span className="font-medium break-all">{tx.to}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatTimestamp(tx.timestamp)}
                            </div>
                            <div className="flex items-center gap-1">
                              <ListNumbers size={12} />
                              {tx.serialNumber}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
