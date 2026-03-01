import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarioCoin, ContentType } from '@/lib/types'
import { MagnifyingGlass, Funnel } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface GlobalLedgerProps {
  globalCoins: MarioCoin[]
}

export function GlobalLedger({ globalCoins }: GlobalLedgerProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all')

  const filteredCoins = useMemo(() => {
    return globalCoins
      .filter((coin) => {
        const matchesSearch =
          coin.content.title.toLowerCase().includes(search.toLowerCase()) ||
          coin.content.description.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filterType === 'all' || coin.content.type === filterType
        return matchesSearch && matchesFilter
      })
      .sort((a, b) => b.mintedAt - a.mintedAt)
  }, [globalCoins, search, filterType])

  const totalValue = globalCoins.reduce((sum, coin) => sum + coin.value, 0)

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-[oklch(0.70_0.24_190)] to-[oklch(0.75_0.26_190)] border-2 border-[oklch(0.75_0.26_190)] text-white">
        <h3 className="text-lg font-semibold mb-2">Global Treasury</h3>
        <p className="text-4xl font-bold tabular-nums">${totalValue.toFixed(2)}</p>
        <p className="text-sm opacity-90 mt-1">{globalCoins.length} coins minted by all users</p>
      </Card>

      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" weight="bold" />
          <Input
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <div className="sm:w-48">
          <Select value={filterType} onValueChange={(v) => setFilterType(v as ContentType | 'all')}>
            <SelectTrigger className="h-12">
              <Funnel size={18} weight="fill" className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="poetry">Poetry</SelectItem>
              <SelectItem value="clout">Clout</SelectItem>
              <SelectItem value="text">Text</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {filteredCoins.length === 0 ? (
            <Card className="p-12 text-center bg-card border-2 border-border">
              <p className="text-muted-foreground">No coins found matching your criteria</p>
            </Card>
          ) : (
            filteredCoins.map((coin) => (
              <Card key={coin.id} className="p-4 bg-card border border-border hover:border-[oklch(0.70_0.24_190)] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-[oklch(0.70_0.24_190)] text-[oklch(0.70_0.24_190)]">
                        {coin.content.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(coin.mintedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg truncate">{coin.content.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{coin.content.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">Minted by {coin.mintedBy}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-[oklch(0.75_0.18_85)] tabular-nums">${coin.value.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
