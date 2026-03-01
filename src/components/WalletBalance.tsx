import { Card } from '@/components/ui/card'
import { TreasuryStats } from '@/lib/types'
import { Coins, Stack, TrendUp } from '@phosphor-icons/react'

export interface WalletBalanceProps {
  stats: TreasuryStats
}

export function WalletBalance({ stats }: WalletBalanceProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-gradient-to-br from-[oklch(0.75_0.18_85)] to-[oklch(0.80_0.20_85)] border-2 border-[oklch(0.85_0.20_85)] text-[oklch(0.15_0.02_280)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-80">Total Treasury Value</p>
            <p className="text-4xl font-bold mt-2 tabular-nums">${stats.totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-[oklch(0.15_0.02_280)] p-3 rounded-lg">
            <Coins size={32} className="text-[oklch(0.75_0.18_85)]" weight="fill" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-[oklch(0.65_0.15_155)] to-[oklch(0.70_0.18_155)] border-2 border-[oklch(0.70_0.18_155)] text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Coins Minted</p>
            <p className="text-4xl font-bold mt-2 tabular-nums">{stats.coinCount}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <Stack size={32} className="text-white" weight="fill" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-[oklch(0.70_0.24_190)] to-[oklch(0.75_0.26_190)] border-2 border-[oklch(0.75_0.26_190)] text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Content Types</p>
            <p className="text-4xl font-bold mt-2 tabular-nums">{Object.keys(stats.contentBreakdown).length}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <TrendUp size={32} className="text-white" weight="fill" />
          </div>
        </div>
      </Card>
    </div>
  )
}
