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

  useEffect(() => {
    const debugState = async () => {
      const keys = await window.spark.kv.keys()
      console.log('KV Keys:', keys)
      const state = await window.spark.kv.get<AppState>('mario-tokens-state')
      console.log('Current State:', state)
      console.log('Total Tokens:', state?.allTokens?.length || 0)
      console.log('Total Transactions:', state?.allTransactions?.length || 0)
    }
    debugState()
    const interval = setInterval(debugState, 10000)
    return () => clearInterval(interval)
  }, [])

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
      <header className="border-b-4 border-accent bg-gradient-to-r from-primary via-[oklch(0.55_0.30_30)] to-primary shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(1_0_0_/_0.05)_10px,oklch(1_0_0_/_0.05)_20px)]"></div>
        <div className="container mx-auto px-4 py-5 md:px-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  y: [0, -5, 0, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="bg-accent p-4 rounded-2xl shadow-2xl border-4 border-white/30"
              >
                <Coins size={48} className="text-accent-foreground drop-shadow-lg" weight="fill" />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold font-serif text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] tracking-tight">
                  Mario Tokens
                </h1>
                <p className="text-base md:text-lg text-accent font-bold drop-shadow-md">Federal Reserve Notes 🍄⭐</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isMinter && (
                <Badge className="hidden md:flex items-center gap-2 bg-accent text-accent-foreground border-3 border-accent-foreground/30 text-base px-4 py-2 shadow-lg">
                  <Seal size={20} weight="fill" />
                  Authorized Minter
                </Badge>
              )}
              <motion.div
                whileHover={{ scale: 1.08, rotate: 5 }}
                whileTap={{ scale: 0.92 }}
              >
                <Avatar className="ring-4 ring-accent shadow-2xl w-14 h-14">
                  <AvatarImage src={user.avatarUrl} alt={user.login} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-bold">{user.login[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="hidden md:block text-white">
                <div className="font-bold text-lg drop-shadow">{user.login}</div>
                <div className="text-sm text-accent/90 drop-shadow">@{user.login}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-8">
        <Tabs defaultValue="wallet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto bg-card/95 backdrop-blur border-3 border-accent/30 p-1.5 shadow-xl">
            <TabsTrigger 
              value="wallet" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-accent data-[state=active]:to-[oklch(0.75_0.22_90)] data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg font-semibold transition-all"
            >
              <Coins size={20} weight="fill" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            {isMinter && (
              <TabsTrigger 
                value="mint" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-[oklch(0.45_0.30_25)] data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-semibold transition-all"
              >
                <Printer size={20} weight="fill" />
                <span className="hidden sm:inline">Mint</span>
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="treasury" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-secondary data-[state=active]:to-[oklch(0.40_0.24_145)] data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg font-semibold transition-all"
            >
              <ChartBar size={20} weight="fill" />
              <span className="hidden sm:inline">Treasury</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ledger" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[oklch(0.60_0.25_270)] data-[state=active]:to-[oklch(0.50_0.25_270)] data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all"
            >
              <Scroll size={20} weight="fill" />
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