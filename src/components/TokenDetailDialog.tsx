import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MarioCoin } from '@/lib/types'
import { MusicNotes, Image, VideoCamera, PenNib, Users, FileText, Clock } from '@phosphor-icons/react'

export interface TokenDetailDialogProps {
  coin: MarioCoin
  open: boolean
  onClose: () => void
}

const contentIcons = {
  music: MusicNotes,
  video: VideoCamera,
  image: Image,
  poetry: PenNib,
  clout: Users,
  text: FileText
}

export function TokenDetailDialog({ coin, open, onClose }: TokenDetailDialogProps) {
  const ContentIcon = contentIcons[coin.content.type] || FileText

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Mario Coin Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">USD Value</p>
              <p className="text-4xl font-bold text-[oklch(0.75_0.18_85)] tabular-nums">${coin.value.toFixed(2)}</p>
            </div>
            <Badge variant="outline" className="border-[oklch(0.70_0.24_190)] text-[oklch(0.70_0.24_190)]">
              {coin.content.type}
            </Badge>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ContentIcon size={20} weight="fill" className="text-[oklch(0.70_0.24_190)]" />
              Content Attachment
            </h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold text-lg mb-2">{coin.content.title}</p>
              <p className="text-muted-foreground">{coin.content.description}</p>
              {coin.content.url && (
                <a
                  href={coin.content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[oklch(0.70_0.24_190)] hover:underline mt-2 inline-block"
                >
                  View Content →
                </a>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock size={20} weight="fill" className="text-muted-foreground" />
              Minting Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Minted By</p>
                <p className="font-semibold">{coin.mintedBy}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Minted On</p>
                <p className="font-semibold">{new Date(coin.mintedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Coin ID</p>
                <p className="font-mono text-xs truncate">{coin.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Transfers</p>
                <p className="font-semibold">{coin.transferHistory.length}</p>
              </div>
            </div>
          </div>

          {coin.transferHistory.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Transfer History</h3>
                <div className="space-y-2">
                  {coin.transferHistory.map((transfer, index) => (
                    <div key={index} className="text-sm bg-muted p-3 rounded">
                      <p className="font-semibold">{transfer.from} → {transfer.to}</p>
                      <p className="text-muted-foreground text-xs">{new Date(transfer.timestamp).toLocaleString()}</p>
                      {transfer.note && <p className="text-xs mt-1 italic">"{transfer.note}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
