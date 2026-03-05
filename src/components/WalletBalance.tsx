import { Card } from '@/components/ui/card'
import { TreasuryStats } from '@/lib/types'
import { Coins, Printer, Stack, TrendUp } from '@phosphor-icons/react'

export interface WalletBalanceProps {
  stats: TreasuryStats
}

export function WalletBalance({ stats }: WalletBalanceProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-[oklch(0.75_0.18_85)] to-[oklch(0.80_0.20_85)] border-2 border-[oklch(0.85_0.20_85)] text-[oklch(0.15_0.02_280)]">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide opacity-80">Total Value</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1 sm:mt-2 tabular-nums truncate">${stats.totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-[oklch(0.15_0.02_280)] p-2 sm:p-3 rounded-lg flex-shrink-0">
            <Coins size={24} className="sm:w-8 sm:h-8 text-[oklch(0.75_0.18_85)]" weight="fill" />
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 bg-gradient-to-br from-[oklch(0.65_0.15_155)] to-[oklch(0.70_0.18_155)] border-2 border-[oklch(0.70_0.18_155)] text-white">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide opacity-90">Coins Minted</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1 sm:mt-2 tabular-nums">{stats.coinCount}</p>
          </div>
          <div className="bg-white/20 p-2 sm:p-3 rounded-lg backdrop-blur-sm flex-shrink-0">
            <Stack size={24} className="sm:w-8 sm:h-8 text-white" weight="fill" />
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 bg-gradient-to-br from-[oklch(0.70_0.24_190)] to-[oklch(0.75_0.26_190)] border-2 border-[oklch(0.75_0.26_190)] text-white">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide opacity-90">Content Types</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1 sm:mt-2 tabular-nums">{Object.keys(stats.contentBreakdown).length}</p>
          </div>
          <div className="bg-white/20 p-2 sm:p-3 rounded-lg backdrop-blur-sm flex-shrink-0">
            <TrendUp size={24} className="sm:w-8 sm:h-8 text-white" weight="fill" />
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 bg-gradient-to-br from-[oklch(0.58_0.24_330)] to-[oklch(0.65_0.25_265)] border-2 border-[oklch(0.65_0.25_265)] text-white sm:col-span-2 xl:col-span-1">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide opacity-90">Printed Usable</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1 sm:mt-2 tabular-nums">{stats.printedUsableTokenCount}</p>
          </div>
          <div className="bg-white/20 p-2 sm:p-3 rounded-lg backdrop-blur-sm flex-shrink-0">
            <Printer size={24} className="sm:w-8 sm:h-8 text-white" weight="fill" />
          </div>
        </div>
      </Card>
    </div>
  )
}
