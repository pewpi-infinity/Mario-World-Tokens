import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MarioCoin } from '@/lib/types'
import { Coins, MusicNotes, Image, VideoCamera, PenNib, Users, FileText, ArrowsLeftRight, Eye, Receipt } from '@phosphor-icons/react'
import { TokenDetailDialog } from '@/components/TokenDetailDialog'
import { ReceiptPrinter } from '@/components/ReceiptPrinter'

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
  const [showReceipt, setShowReceipt] = useState(false)
  const ContentIcon = contentIcons[coin.content.type] || FileText

  const hasMediaPreview = (coin.content.type === 'video' && coin.content.data) || 
                          (coin.content.type === 'image' && coin.content.data)

  return (
    <>
      <Card className="p-4 sm:p-6 bg-card border-2 border-border hover:border-[oklch(0.75_0.18_85)] transition-all hover:shadow-lg group">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="bg-gradient-to-br from-[oklch(0.75_0.18_85)] to-[oklch(0.80_0.20_85)] p-2 sm:p-3 rounded-lg flex-shrink-0">
            <Coins size={24} className="sm:w-8 sm:h-8 text-[oklch(0.15_0.02_280)]" weight="fill" />
          </div>
          <Badge variant="outline" className="border-[oklch(0.65_0.15_155)] text-[oklch(0.65_0.15_155)] text-xs">
            {coin.content.type}
          </Badge>
        </div>

        {hasMediaPreview && (
          <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden bg-muted">
            {coin.content.type === 'video' && coin.content.data && (
              <video 
                src={coin.content.data} 
                controls 
                className="w-full h-32 object-cover"
                preload="metadata"
              />
            )}
            {coin.content.type === 'image' && coin.content.data && (
              <img 
                src={coin.content.data} 
                alt={coin.content.title}
                className="w-full h-32 object-cover"
              />
            )}
          </div>
        )}

        <div className="mb-3 sm:mb-4">
          <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">${coin.value.toFixed(2)}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Minted {new Date(coin.mintedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-start gap-2 mb-3 sm:mb-4 p-2 sm:p-3 bg-muted rounded-lg">
          <ContentIcon size={18} className="sm:w-5 sm:h-5 text-[oklch(0.70_0.24_190)] flex-shrink-0 mt-0.5" weight="fill" />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{coin.content.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{coin.content.description}</p>
          </div>
        </div>

        {coin.content.stickers && coin.content.stickers.length > 0 && (
          <div className="flex gap-2 mb-3 sm:mb-4 flex-wrap">
            {coin.content.stickers.slice(0, 3).map((sticker, i) => (
              <img key={i} src={sticker} alt="Sticker" className="w-8 h-8 pixel-pop" />
            ))}
            {coin.content.stickers.length > 3 && (
              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs">
                +{coin.content.stickers.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowDetails(true)}
          >
            <Eye size={14} className="sm:w-4 sm:h-4" weight="bold" />
            <span className="ml-1 sm:ml-2 text-xs sm:text-sm">Details</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReceipt(true)}
            className="border-[oklch(0.65_0.15_155)] text-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.65_0.15_155)] hover:text-white px-2 sm:px-3"
          >
            <Receipt size={14} className="sm:w-4 sm:h-4" weight="bold" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-[oklch(0.70_0.24_190)] text-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.70_0.24_190)] hover:text-white"
            onClick={() => onTransfer(coin.id)}
          >
            <ArrowsLeftRight size={14} className="sm:w-4 sm:h-4" weight="bold" />
            <span className="ml-1 sm:ml-2 text-xs sm:text-sm hidden sm:inline">Transfer</span>
            <span className="ml-1 sm:hidden text-xs">Send</span>
          </Button>
        </div>
      </Card>

      <TokenDetailDialog
        coin={coin}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />

      <ReceiptPrinter
        coin={coin}
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        type="minting"
      />
    </>
  )
}
