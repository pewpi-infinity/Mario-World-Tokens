import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins, TrendUp, Globe, Plus } from '@phosphor-icons/react'
import { MintingInterface } from '@/components/MintingInterface'
import { WalletBalance } from '@/components/WalletBalance'
import { TreasuryCharts } from '@/components/TreasuryCharts'
import { GlobalLedger } from '@/components/GlobalLedger'
import { TokenCard } from '@/components/TokenCard'
import { MarioCoin, TreasuryStats } from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import marioImage from '@/assets/images/Screenshot_20260225-192747.png'

function App() {
  const [coins, setCoins] = useKV<MarioCoin[]>('mario-coins', [])
  const [globalCoins, setGlobalCoins] = useKV<MarioCoin[]>('global-mario-coins', [])
  const [activeTab, setActiveTab] = useState('treasury')
  const [showMinting, setShowMinting] = useState(false)
  const [currentUser] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`)

  const userCoins = coins || []

  const treasuryStats: TreasuryStats = {
    totalValue: userCoins.reduce((sum, coin) => sum + coin.value, 0),
    coinCount: userCoins.length,
    contentBreakdown: userCoins.reduce((acc, coin) => {
      acc[coin.content.type] = (acc[coin.content.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    mintingHistory: userCoins
      .sort((a, b) => a.mintedAt - b.mintedAt)
      .map((coin, index, arr) => ({
        timestamp: coin.mintedAt,
        value: coin.value,
        totalValue: arr.slice(0, index + 1).reduce((sum, c) => sum + c.value, 0)
      }))
  }

  const handleMint = (newCoin: MarioCoin) => {
    setCoins((current) => [...(current || []), newCoin])
    setGlobalCoins((current) => [...(current || []), newCoin])
    setShowMinting(false)
    toast.success('Mario Coin Minted!', {
      description: `$${newCoin.value.toFixed(2)} backed by ${newCoin.content.type}`
    })
  }

  useEffect(() => {
    if (userCoins.length === 0 && activeTab === 'treasury') {
      const timer = setTimeout(() => {
        toast.info('Start Minting!', {
          description: 'Click "Mint New Coin" to create your first Mario Currency',
          duration: 5000
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [userCoins.length, activeTab])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-[oklch(0.75_0.18_85)] bg-gradient-to-r from-[oklch(0.58_0.24_330)] via-[oklch(0.65_0.25_265)] to-[oklch(0.70_0.24_190)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(1_0_0_/_0.05)_10px,oklch(1_0_0_/_0.05)_20px)]"></div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-[oklch(0.75_0.18_85)] p-3 rounded-lg shadow-lg border-2 border-[oklch(0.85_0.20_85)] overflow-hidden">
                <div className="w-12 h-12 relative">
                  <img 
                    src={marioImage} 
                    alt="Mario Logo" 
                    className="absolute object-cover"
                    style={{
                      width: '200%',
                      height: '200%',
                      top: '-70%',
                      left: '-25%',
                      objectPosition: 'center center'
                    }}
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg pixel-font">
                  FEDERAL RESERVE MARIO
                </h1>
                <p className="text-sm md:text-base text-[oklch(0.75_0.18_85)] font-semibold drop-shadow">
                  People's Treasury Creation System 🪙
                </p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => setShowMinting(true)}
              className="bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)] font-bold shadow-lg"
            >
              <Plus size={24} weight="bold" />
              <span className="ml-2">Mint New Coin</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <WalletBalance stats={treasuryStats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-muted p-1">
            <TabsTrigger
              value="treasury"
              className="flex items-center gap-2 data-[state=active]:bg-[oklch(0.75_0.18_85)] data-[state=active]:text-[oklch(0.15_0.02_280)]"
            >
              <Coins size={20} weight="fill" />
              <span>My Treasury</span>
            </TabsTrigger>
            <TabsTrigger
              value="charts"
              className="flex items-center gap-2 data-[state=active]:bg-[oklch(0.65_0.15_155)] data-[state=active]:text-white"
            >
              <TrendUp size={20} weight="fill" />
              <span>Charts</span>
            </TabsTrigger>
            <TabsTrigger
              value="ledger"
              className="flex items-center gap-2 data-[state=active]:bg-[oklch(0.70_0.24_190)] data-[state=active]:text-white"
            >
              <Globe size={20} weight="fill" />
              <span>Global Ledger</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="treasury" className="mt-8">
            {userCoins.length === 0 ? (
              <Card className="p-12 text-center bg-card border-2 border-border">
                <div className="max-w-md mx-auto">
                  <Coins size={64} className="mx-auto mb-4 text-muted-foreground" weight="fill" />
                  <h3 className="text-2xl font-bold mb-2">No Coins Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start minting Mario Coins backed by your creative content. You are your own central bank!
                  </p>
                  <Button
                    size="lg"
                    onClick={() => setShowMinting(true)}
                    className="bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)]"
                  >
                    <Plus size={24} weight="bold" />
                    <span className="ml-2">Mint Your First Coin</span>
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCoins.map((coin) => (
                  <TokenCard
                    key={coin.id}
                    coin={coin}
                    onTransfer={(coinId) => {
                      toast.info('Transfer feature coming soon!')
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="charts" className="mt-8">
            <TreasuryCharts stats={treasuryStats} marioLogo={marioImage} />
          </TabsContent>

          <TabsContent value="ledger" className="mt-8">
            <GlobalLedger globalCoins={globalCoins || []} />
          </TabsContent>
        </Tabs>
      </main>

      <MintingInterface
        open={showMinting}
        onClose={() => setShowMinting(false)}
        onMint={handleMint}
        currentUser={currentUser}
      />

      <Toaster />
    </div>
  )
}

export default App
