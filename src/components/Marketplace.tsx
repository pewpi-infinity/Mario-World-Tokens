import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Storefront, PaperPlaneTilt, ArrowsLeftRight, CheckCircle } from '@phosphor-icons/react'
import { MarioCoin } from '@/lib/types'
import { TokenCard } from '@/components/TokenCard'
import { toast } from 'sonner'

interface MarketplaceListing {
  id: string
  coin: MarioCoin
  seller: string
  price: number
  listedAt: number
}

interface MarketplaceProps {
  userCoins: MarioCoin[]
  currentUser: string
  onTransferComplete: (fromUser: string, toUser: string, coin: MarioCoin) => void
}

export function Marketplace({ userCoins, currentUser, onTransferComplete }: MarketplaceProps) {
  const [listings, setListings] = useKV<MarketplaceListing[]>('marketplace-listings', [])
  const [selectedCoin, setSelectedCoin] = useState<MarioCoin | null>(null)
  const [recipientId, setRecipientId] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  const myListings = (listings || []).filter(l => l.seller === currentUser)
  const otherListings = (listings || []).filter(l => l.seller !== currentUser)

  const handleListCoin = () => {
    if (!selectedCoin) {
      toast.error('Please select a coin to list')
      return
    }

    const newListing: MarketplaceListing = {
      id: `listing-${Date.now()}`,
      coin: selectedCoin,
      seller: currentUser,
      price: selectedCoin.value,
      listedAt: Date.now()
    }

    setListings((current) => [...(current || []), newListing])
    setSelectedCoin(null)
    toast.success('Coin listed on marketplace!')
  }

  const handleRemoveListing = (listingId: string) => {
    setListings((current) => (current || []).filter(l => l.id !== listingId))
    toast.success('Listing removed')
  }

  const handleDirectTransfer = async () => {
    if (!selectedCoin) {
      toast.error('Please select a coin to transfer')
      return
    }

    if (!recipientId.trim()) {
      toast.error('Please enter recipient ID')
      return
    }

    if (recipientId.trim() === currentUser) {
      toast.error('Cannot transfer to yourself')
      return
    }

    setIsTransferring(true)

    try {
      onTransferComplete(currentUser, recipientId.trim(), selectedCoin)
      setSelectedCoin(null)
      setRecipientId('')
      toast.success(`Coin transferred to ${recipientId}!`)
    } catch (error) {
      toast.error('Transfer failed')
    } finally {
      setIsTransferring(false)
    }
  }

  const handleBuyListing = (listing: MarketplaceListing) => {
    handleRemoveListing(listing.id)
    onTransferComplete(listing.seller, currentUser, listing.coin)
    toast.success(`Purchased coin for $${listing.price.toFixed(2)}!`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Storefront size={32} weight="fill" className="text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Mario Coin Marketplace</h2>
          <p className="text-muted-foreground">Transfer coins directly or list them for others</p>
        </div>
      </div>

      <Tabs defaultValue="transfer" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="transfer">
            <PaperPlaneTilt size={18} weight="fill" />
            <span className="ml-2">Send</span>
          </TabsTrigger>
          <TabsTrigger value="mylistings">
            <ArrowsLeftRight size={18} weight="fill" />
            <span className="ml-2">My Listings</span>
          </TabsTrigger>
          <TabsTrigger value="browse">
            <Storefront size={18} weight="fill" />
            <span className="ml-2">Browse</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Direct Transfer</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Coin to Transfer</label>
                {userCoins.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No coins available to transfer</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
                    {userCoins.map((coin) => (
                      <div
                        key={coin.id}
                        onClick={() => setSelectedCoin(coin)}
                        className={`cursor-pointer transition-all ${
                          selectedCoin?.id === coin.id
                            ? 'ring-2 ring-primary scale-105'
                            : 'hover:scale-102'
                        }`}
                      >
                        <TokenCard coin={coin} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedCoin && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={20} weight="fill" className="text-primary" />
                    <span className="font-semibold">Selected:</span>
                    <span>{selectedCoin.content.title} (${selectedCoin.value.toFixed(2)})</span>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="recipient" className="text-sm font-medium mb-2 block">Recipient User ID</label>
                <Input
                  id="recipient"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  placeholder="Enter recipient's user ID"
                  className="h-12"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSelectedCoin(null)
                    setRecipientId('')
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={!selectedCoin && !recipientId}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleDirectTransfer}
                  disabled={!selectedCoin || !recipientId || isTransferring}
                  className="flex-1 bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)]"
                >
                  <PaperPlaneTilt size={20} weight="fill" />
                  <span className="ml-2">{isTransferring ? 'Sending...' : 'Send Coin'}</span>
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mylistings" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Marketplace Listings</h3>
              <Badge variant="secondary">{myListings.length} Listed</Badge>
            </div>

            {myListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't listed any coins yet</p>
                <p className="text-sm text-muted-foreground">Select a coin below to list it</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {myListings.map((listing) => (
                  <div key={listing.id} className="relative">
                    <TokenCard coin={listing.coin} />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveListing(listing.id)}
                      className="mt-2 w-full"
                    >
                      Remove Listing
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold mb-3">List a New Coin</h4>
              {userCoins.filter(c => !myListings.some(l => l.coin.id === c.id)).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">All your coins are already listed</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCoins
                    .filter(c => !myListings.some(l => l.coin.id === c.id))
                    .map((coin) => (
                      <div
                        key={coin.id}
                        onClick={() => setSelectedCoin(coin)}
                        className={`cursor-pointer transition-all ${
                          selectedCoin?.id === coin.id
                            ? 'ring-2 ring-primary scale-105'
                            : 'hover:scale-102'
                        }`}
                      >
                        <TokenCard coin={coin} />
                      </div>
                    ))}
                </div>
              )}
              {selectedCoin && !myListings.some(l => l.coin.id === selectedCoin.id) && (
                <Button
                  onClick={handleListCoin}
                  className="mt-4 w-full bg-[oklch(0.65_0.15_155)] text-white hover:bg-[oklch(0.70_0.17_155)]"
                >
                  List Selected Coin for ${selectedCoin.value.toFixed(2)}
                </Button>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Coins</h3>
              <Badge variant="secondary">{otherListings.length} Available</Badge>
            </div>

            {otherListings.length === 0 ? (
              <div className="text-center py-12">
                <Storefront size={64} className="mx-auto mb-4 text-muted-foreground" weight="fill" />
                <p className="text-muted-foreground">No coins listed for sale yet</p>
                <p className="text-sm text-muted-foreground mt-2">Check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherListings.map((listing) => (
                  <div key={listing.id}>
                    <TokenCard coin={listing.coin} />
                    <div className="mt-2 space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Seller: {listing.seller.substring(0, 12)}...
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleBuyListing(listing)}
                        className="w-full bg-[oklch(0.70_0.24_190)] text-white hover:bg-[oklch(0.75_0.26_190)]"
                      >
                        Buy for ${listing.price.toFixed(2)}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
