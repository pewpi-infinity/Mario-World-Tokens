import { Sticker } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash } from '@phosphor-icons/react'

interface StickerPanelProps {
  stickers: Sticker[]
  onStickersChange: (stickers: Sticker[]) => void
}

const availableStickers = [
  '⭐', '🍄', '🪙', '👑', '🔥', '❄️',
  '💎', '🎮', '🏆', '💥', '✨', '🌟',
  '🎵', '💫', '🌈', '🎨', '🎪', '🎯'
]

export function StickerPanel({ stickers, onStickersChange }: StickerPanelProps) {
  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      type: emoji,
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
      scale: 1,
      rotation: 0
    }
    onStickersChange([...stickers, newSticker])
  }

  const removeSticker = (id: string) => {
    onStickersChange(stickers.filter(s => s.id !== id))
  }

  const clearAllStickers = () => {
    onStickersChange([])
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-semibold">Add Stickers</Label>
          {stickers.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllStickers}
              className="text-destructive hover:text-destructive"
            >
              <Trash size={16} weight="bold" />
              Clear All
            </Button>
          )}
        </div>
        <ScrollArea className="h-48">
          <div className="grid grid-cols-6 gap-2">
            {availableStickers.map((emoji) => (
              <Button
                key={emoji}
                variant="outline"
                className="text-2xl p-2 h-12 hover:scale-110 transition-transform hover:border-accent"
                onClick={() => addSticker(emoji)}
                disabled={stickers.length >= 20}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </ScrollArea>
        {stickers.length >= 20 && (
          <p className="text-xs text-destructive mt-2">
            Maximum of 20 stickers reached
          </p>
        )}
      </div>

      {stickers.length > 0 && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">Active Stickers</Label>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="flex items-center justify-between bg-muted p-2 rounded"
                >
                  <span className="text-xl">{sticker.type}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSticker(sticker.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
