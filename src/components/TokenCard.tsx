import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MarioCoin } from '@/lib/types'
import { Coins, MusicNotes, Image, VideoCamera, PenNib, Users, FileText, ArrowsLeftRight, Eye } from '@phosphor-icons/react'
import { TokenDetailDialog } from '@/components/TokenDetailDialog'

export interface TokenCardProps {
  coin: MarioCoin
  onTransfer: (coinId: string) => void
}

const contentIcons = {
  music: MusicNotes,
  video: VideoCamera,
  image: Image,
  poetry: PenNib,
  clout: Users,
  text: FileText
}

export function TokenCard({ coin, onTransfer }: TokenCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const ContentIcon = contentIcons[coin.content.type] || FileText

  return (
    <>
      <Card className="p-6 bg-card border-2 border-border hover:border-[oklch(0.75_0.18_85)] transition-all hover:shadow-lg group">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-gradient-to-br from-[oklch(0.75_0.18_85)] to-[oklch(0.80_0.20_85)] p-3 rounded-lg">
            <Coins size={32} className="text-[oklch(0.15_0.02_280)]" weight="fill" />
          </div>
          <Badge variant="outline" className="border-[oklch(0.65_0.15_155)] text-[oklch(0.65_0.15_155)]">
            {coin.content.type}
          </Badge>
        </div>

        <div className="mb-4">
          <p className="text-3xl font-bold text-foreground tabular-nums">${coin.value.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Minted {new Date(coin.mintedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-start gap-2 mb-4 p-3 bg-muted rounded-lg">
          <ContentIcon size={20} className="text-[oklch(0.70_0.24_190)] flex-shrink-0 mt-0.5" weight="fill" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{coin.content.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{coin.content.description}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowDetails(true)}
          >
            <Eye size={16} weight="bold" />
            <span className="ml-2">Details</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-[oklch(0.70_0.24_190)] text-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.70_0.24_190)] hover:text-white"
            onClick={() => onTransfer(coin.id)}
          >
            <ArrowsLeftRight size={16} weight="bold" />
            <span className="ml-2">Transfer</span>
          </Button>
        </div>
      </Card>

      <TokenDetailDialog
        coin={coin}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  )
}
