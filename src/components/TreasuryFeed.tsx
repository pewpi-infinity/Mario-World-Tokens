import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MarioCoin, TreasuryStats } from '@/lib/types'

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return s + 's ago'
  const m = Math.floor(s / 60)
  if (m < 60) return m + 'm ago'
  const h = Math.floor(m / 60)
  if (h < 24) return h + 'h ago'
  return Math.floor(h / 24) + 'd ago'
}

const CMAP: Record<string, string> = {
  music: 'oklch(0.70 0.24 330)', video: 'oklch(0.70 0.24 190)',
  image: 'oklch(0.75 0.18 85)', poetry: 'oklch(0.70 0.20 145)',
  clout: 'oklch(0.70 0.24 30)', text: 'oklch(0.60 0.15 260)',
}
const EMAP: Record<string, string> = {
  music: '🎵', video: '🎬', image: '🖼️',
  poetry: '📝', clout: '⭐', text: '📄',
}

interface TreasuryFeedProps {
  globalCoins: MarioCoin[]
  stats: TreasuryStats
}

export function TreasuryFeed({ globalCoins, stats }: TreasuryFeedProps) {
  const [, setNow] = useState(Date.now())
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(iv)
  }, [])

  const sorted = useMemo(() =>
    [...globalCoins].sort((a, b) => b.mintedAt - a.mintedAt)
  , [globalCoins])

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6 border-2 border-[oklch(0.75_0.18_85)] bg-gradient-to-br from-[oklch(0.20_0.02_280)] to-[oklch(0.15_0.01_280)]">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold pixel-font text-[oklch(0.75_0.18_85)] mb-1">
            🏦 MARIO WORLD TREASURY
          </h2>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-3">
            <div>
              <p className="text-xs text-muted-foreground">Total Tokens</p>
              <p className="text-2xl sm:text-3xl font-bold text-[oklch(0.75_0.18_85)] tabular-nums">{stats.coinCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-2xl sm:text-3xl font-bold text-[oklch(0.80_0.20_145)] tabular-nums">${stats.totalValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receipts</p>
              <p className="text-2xl sm:text-3xl font-bold text-[oklch(0.70_0.24_190)] tabular-nums">{stats.printedUsableTokenCount}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 px-1">
        <span className="inline-block w-2 h-2 rounded-full bg-[oklch(0.70_0.24_145)] animate-pulse" />
        <span className="text-sm font-semibold text-[oklch(0.70_0.24_145)]">LIVE FEED</span>
        <span className="text-xs text-muted-foreground ml-auto">{sorted.length} tokens</span>
      </div>

      <ScrollArea className="h-[520px]">
        <div className="space-y-2 pr-2">
          {sorted.length === 0 ? (
            <Card className="p-8 text-center bg-card border-2 border-dashed border-border">
              <p className="text-2xl mb-2">🪙</p>
              <p className="text-muted-foreground text-sm">No tokens minted yet</p>
            </Card>
          ) : sorted.map((coin, i) => {
            const bc = CMAP[coin.content.type] || CMAP.text
            const em = EMAP[coin.content.type] || '🪙'
            const printed = coin.transferHistory.some(t => t.receiptPrinted)
            const fresh = Date.now() - coin.mintedAt < 60000
            return (
              <Card key={coin.id}
                className="p-3 sm:p-4 bg-card border-l-4 hover:bg-accent/30 transition-all"
                style={{ borderLeftColor: bc, animation: fresh ? 'slideInFeed 0.4s ease-out' : undefined }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">{em}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-[oklch(0.75_0.18_85)] text-xs tabular-nums pixel-font">#{sorted.length - i}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: bc, color: bc }}>{coin.content.type}</Badge>
                      {printed && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">🖨️</Badge>}
                      {fresh && <Badge className="text-[10px] px-1.5 py-0 bg-[oklch(0.70_0.24_145)] text-white animate-pulse">NEW</Badge>}
                    </div>
                    <h4 className="font-semibold text-sm truncate">{coin.content.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{coin.content.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>by <strong className="text-foreground/80">{coin.mintedBy}</strong></span>
                      <span>{timeAgo(coin.mintedAt)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-[oklch(0.75_0.18_85)] tabular-nums">${coin.value.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
      <style>{`@keyframes slideInFeed{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  )
}
