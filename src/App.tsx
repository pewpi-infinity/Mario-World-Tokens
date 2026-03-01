import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { MarioToken, Transaction, AppState } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Seal, Coins, Printer, Scroll, ChartBar } from '@phosphor-icons/react'
import { WalletBalance } from '@/components/WalletBalance'
import { TokenCard } from '@/components/TokenCard'
import { MintingInterface } from '@/components/MintingInterface'
import { TransferDialog } from '@/components/TransferDialog'
import { GlobalLedger } from '@/components/GlobalLedger'
import { TokenDetailDialog } from '@/components/TokenDetailDialog'
import { TreasuryCharts } from '@/components/TreasuryCharts'
import { AutoAssessment } from '@/components/AutoAssessment'
import { Toaster } from '@/components/ui/sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

function App() {
  const [user, setUser] = useState<{ login: string; avatarUrl: string } | null>(null)
  const [appState, setAppState] = useKV<AppState>('mario-tokens-state', {
    allTokens: [],
    allTransactions: [],
    minters: [],
  })
  const [selectedToken, setSelectedToken] = useState<MarioToken | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const userData = await window.spark.user()
      if (!userData) return
      
      setUser(userData)
      
      if (userData.isOwner) {
        setAppState((currentState) => {
          const state = currentState || { allTokens: [], allTransactions: [], minters: [] }
          if (!state.minters.includes(userData.login)) {
            return {
              ...state,
              minters: [...state.minters, userData.login]
            }
          }
          return state
        })
      }
    }
    loadUser()
  }, [setAppState])

  const isMinter = user && appState && appState.minters.includes(user.login)
  const userTokens = appState ? appState.allTokens.filter(token => token.currentOwner === user?.login) : []

  const handleMint = (newToken: MarioToken) => {
    setAppState((currentState) => {
      const state = currentState || { allTokens: [], allTransactions: [], minters: [] }
      return {
        ...state,
        allTokens: [...state.allTokens, newToken]
      }
    })
  }

  const handleTransfer = (tokenIds: string[], recipient: string) => {
    const timestamp = Date.now()
    const newTransactions: Transaction[] = tokenIds.map(tokenId => {
      const token = appState!.allTokens.find(t => t.id === tokenId)!
      return {
        id: `tx-${timestamp}-${tokenId}`,
        tokenId,
        from: user!.login,
        to: recipient,
        timestamp,
        serialNumber: token.serialNumber,
        denomination: token.denomination,
      }
    })

    setAppState((currentState) => {
      const state = currentState || { allTokens: [], allTransactions: [], minters: [] }
      return {
        ...state,
        allTokens: state.allTokens.map(token =>
          tokenIds.includes(token.id)
            ? { ...token, currentOwner: recipient }
            : token
        ),
        allTransactions: [...state.allTransactions, ...newTransactions]
      }
    })
  }

  const handleTokenClick = (token: MarioToken) => {
    setSelectedToken(token)
    setDetailDialogOpen(true)
  }

  const handleProvenanceUpdate = (tokenId: string, provenance: any) => {
    setAppState((currentState) => {
      const state = currentState || { allTokens: [], allTransactions: [], minters: [] }
      return {
        ...state,
        allTokens: state.allTokens.map(token =>
          token.id === tokenId
            ? { ...token, provenance }
            : token
        )
      }
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins size={32} className="text-primary" weight="fill" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-serif">Mario Tokens</h1>
                <p className="text-sm text-muted-foreground">Federal Reserve Notes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isMinter && (
                <Badge variant="secondary" className="hidden md:flex items-center gap-1">
                  <Seal size={16} weight="fill" />
                  Authorized Minter
                </Badge>
              )}
              <Avatar>
                <AvatarImage src={user.avatarUrl} alt={user.login} />
                <AvatarFallback>{user.login[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="font-medium">{user.login}</div>
                <div className="text-xs text-muted-foreground">@{user.login}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-8">
        <Tabs defaultValue="wallet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Coins size={18} />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            {isMinter && (
              <TabsTrigger value="mint" className="flex items-center gap-2">
                <Printer size={18} />
                <span className="hidden sm:inline">Mint</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="treasury" className="flex items-center gap-2">
              <ChartBar size={18} />
              <span className="hidden sm:inline">Treasury</span>
            </TabsTrigger>
            <TabsTrigger value="ledger" className="flex items-center gap-2">
              <Scroll size={18} />
              <span className="hidden sm:inline">Ledger</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <WalletBalance tokens={userTokens} />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold font-serif">Your Tokens</h2>
                  {userTokens.length > 0 && (
                    <TransferDialog
                      availableTokens={userTokens}
                      onTransfer={handleTransfer}
                    />
                  )}
                </div>
                <ScrollArea className="h-[600px]">
                  {userTokens.length === 0 ? (
                    <div className="text-center py-12">
                      <Coins size={64} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg text-muted-foreground">No tokens in your wallet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isMinter ? 'Mint some tokens to get started' : 'Wait for tokens to be distributed to you'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userTokens.map((token) => (
                        <TokenCard
                          key={token.id}
                          token={token}
                          onClick={() => handleTokenClick(token)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {isMinter && (
            <TabsContent value="mint" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <MintingInterface
                  currentUser={user.login}
                  onMint={handleMint}
                />
              </div>
            </TabsContent>
          )}

          <TabsContent value="ledger" className="space-y-6">
            <GlobalLedger
              tokens={appState?.allTokens || []}
              transactions={appState?.allTransactions || []}
            />
          </TabsContent>

          <TabsContent value="treasury" className="space-y-6">
            <AutoAssessment tokens={appState?.allTokens || []} />
            <TreasuryCharts
              tokens={appState?.allTokens || []}
              transactions={appState?.allTransactions || []}
            />
          </TabsContent>
        </Tabs>
      </main>

      <TokenDetailDialog
        token={selectedToken}
        transactions={appState?.allTransactions || []}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onProvenanceUpdate={handleProvenanceUpdate}
      />

      <Toaster />
    </div>
  )
}

export default App