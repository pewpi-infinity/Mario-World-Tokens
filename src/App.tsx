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
import { motion } from 'framer-motion'

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
    <div className="min-h-screen mario-bg">
      <header className="border-b-4 border-primary/30 bg-gradient-to-r from-[oklch(0.60_0.10_25)] to-[oklch(0.58_0.12_30)] shadow-lg">
        <div className="container mx-auto px-4 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-accent p-3 rounded-xl shadow-lg"
              >
                <Coins size={40} className="text-accent-foreground" weight="fill" />
              </motion.div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-white drop-shadow-lg">Mario Tokens</h1>
                <p className="text-sm text-white/90 font-medium">Federal Reserve Notes 🍄</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isMinter && (
                <Badge className="hidden md:flex items-center gap-1 bg-accent text-accent-foreground border-2 border-accent-foreground/20">
                  <Seal size={16} weight="fill" />
                  Authorized Minter
                </Badge>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="ring-4 ring-accent/50">
                  <AvatarImage src={user.avatarUrl} alt={user.login} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{user.login[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="hidden md:block text-white">
                <div className="font-bold">{user.login}</div>
                <div className="text-xs opacity-90">@{user.login}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-8">
        <Tabs defaultValue="wallet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto bg-card border-2 border-primary/20 p-1">
            <TabsTrigger value="wallet" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Coins size={18} weight="fill" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            {isMinter && (
              <TabsTrigger value="mint" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Printer size={18} weight="fill" />
                <span className="hidden sm:inline">Mint</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="treasury" className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <ChartBar size={18} weight="fill" />
              <span className="hidden sm:inline">Treasury</span>
            </TabsTrigger>
            <TabsTrigger value="ledger" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[oklch(0.65_0.25_25)] data-[state=active]:to-[oklch(0.55_0.25_25)] data-[state=active]:text-white">
              <Scroll size={18} weight="fill" />
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
                  allTokens={appState?.allTokens || []}
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