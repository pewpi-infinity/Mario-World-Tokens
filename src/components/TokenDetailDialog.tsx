import { useState } from 'react'
import { MarioToken, Transaction, NoteProvenance } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { MapPin, Seal, Sparkle, User, ListNumbers, ArrowRight, Clock, Printer, Receipt, TrendUp, Palette, Buildings } from '@phosphor-icons/react'
import { formatTimestamp, isRareSerial, getDenominationColor, assessNoteProvenance, calculateNoteValue } from '@/lib/currency'
import { PrintableReceipt } from './PrintableReceipt'
import { toast } from 'sonner'

interface TokenDetailDialogProps {
  token: MarioToken | null
  transactions: Transaction[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onProvenanceUpdate: (tokenId: string, provenance: NoteProvenance) => void
}

export function TokenDetailDialog({ token, transactions, open, onOpenChange, onProvenanceUpdate }: TokenDetailDialogProps) {
  const [assessingProvenance, setAssessingProvenance] = useState(false)
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)

  if (!token) return null

  const tokenTransactions = transactions
    .filter(t => t.tokenId === token.id)
    .sort((a, b) => b.timestamp - a.timestamp)
  
  const isRare = isRareSerial(token.serialNumber)
  const transferCount = tokenTransactions.length
  const noteValue = token.provenance ? calculateNoteValue(token) : null

  const handleAssessProvenance = async () => {
    setAssessingProvenance(true)
    const loadingToast = toast.loading('Assessing note provenance...')
    try {
      const provenance = await assessNoteProvenance(token)
      onProvenanceUpdate(token.id, provenance)
      toast.success('Provenance assessment complete!', { id: loadingToast })
    } catch (error) {
      toast.error('Failed to assess provenance', { id: loadingToast })
    } finally {
      setAssessingProvenance(false)
    }
  }

  const handlePrintReceipt = (transaction: Transaction) => {
    setReceiptTransaction(transaction)
    setReceiptDialogOpen(true)
  }

  return (
    <>
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="provenance">Value</TabsTrigger>
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

          <TabsContent value="provenance" className="flex-1 overflow-auto mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {!token.provenance ? (
                  <div className="text-center py-12">
                    <TrendUp size={64} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Provenance Not Assessed</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Assess this note's artistic value, historical significance, and collectible potential
                    </p>
                    <Button onClick={handleAssessProvenance} disabled={assessingProvenance}>
                      <Sparkle size={18} className="mr-2" weight="fill" />
                      {assessingProvenance ? 'Assessing...' : 'Assess Provenance'}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-6 rounded-lg border-2 border-accent/30">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold font-serif">Note Valuation</h3>
                        {noteValue && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Estimated Value</p>
                            <p className="text-2xl font-bold text-accent">${noteValue.totalValue.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                      {noteValue && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Face Value</p>
                            <p className="font-medium">${noteValue.baseValue}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Collectible Premium</p>
                            <p className="font-medium text-accent">${noteValue.collectibleValue.toFixed(2)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Palette size={20} className="text-primary" />
                        <h4 className="font-semibold">Artistic Value</h4>
                      </div>
                      <Progress value={token.provenance.artisticValue} className="h-2" />
                      <p className="text-sm text-muted-foreground">{token.provenance.artisticValue}/100</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Buildings size={20} className="text-primary" />
                        <h4 className="font-semibold">Historical Significance</h4>
                      </div>
                      <Progress value={token.provenance.historicalSignificance} className="h-2" />
                      <p className="text-sm text-muted-foreground">{token.provenance.historicalSignificance}/100</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendUp size={20} className="text-primary" />
                        <h4 className="font-semibold">Cultural Impact</h4>
                      </div>
                      <Progress value={token.provenance.culturalImpact} className="h-2" />
                      <p className="text-sm text-muted-foreground">{token.provenance.culturalImpact}/100</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Seal size={16} />
                          <p className="text-sm font-medium">Famous Minter</p>
                        </div>
                        <p className={`text-lg font-bold ${token.provenance.famousMinter ? 'text-accent' : 'text-muted-foreground'}`}>
                          {token.provenance.famousMinter ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkle size={16} />
                          <p className="text-sm font-medium">Unique Design</p>
                        </div>
                        <p className={`text-lg font-bold ${token.provenance.uniqueDesign ? 'text-accent' : 'text-muted-foreground'}`}>
                          {token.provenance.uniqueDesign ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>

                    <Button onClick={handleAssessProvenance} variant="outline" className="w-full" disabled={assessingProvenance}>
                      <Sparkle size={18} className="mr-2" weight="fill" />
                      Reassess Provenance
                    </Button>
                  </>
                )}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintReceipt(tx)}
                            >
                              <Receipt size={16} />
                            </Button>
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

    <PrintableReceipt
      transaction={receiptTransaction!}
      token={token}
      open={receiptDialogOpen}
      onOpenChange={setReceiptDialogOpen}
    />
  </>
  )
}
