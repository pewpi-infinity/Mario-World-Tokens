import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Crown, CirclesFour, Coin, Lightning, Heart } from '@phosphor-icons/react'

interface MarioStickersProps {
  onStickerSelect: (stickerData: string) => void
}

interface StickerStyle {
  name: string
  character: string
  colors: string[]
}

const stickerStyles: StickerStyle[] = [
  { name: 'Classic Mario', character: 'M', colors: ['#E63946', '#1D3557', '#FFD700'] },
  { name: 'Luigi Racer', character: 'L', colors: ['#2A9D8F', '#1D3557', '#FFD700'] },
  { name: 'Peach Royal', character: 'P', colors: ['#FFC0CB', '#FFD700', '#E63946'] },
  { name: 'Toad Helper', character: 'T', colors: ['#E63946', '#FFFFFF', '#FFD700'] },
  { name: 'Yoshi Runner', character: 'Y', colors: ['#2A9D8F', '#E63946', '#FFFFFF'] },
  { name: 'Bowser Power', character: 'B', colors: ['#E63946', '#264653', '#FFD700'] }
]

const stampIcons = [
  { name: 'Star', icon: Star, color: '#FFD700' },
  { name: 'Crown', icon: Crown, color: '#FFD700' },
  { name: 'Power', icon: CirclesFour, color: '#E63946' },
  { name: 'Coin', icon: Coin, color: '#FFD700' },
  { name: 'Lightning', icon: Lightning, color: '#457B9D' },
  { name: 'Heart', icon: Heart, color: '#E63946' }
]

export function MarioStickers({ onStickerSelect }: MarioStickersProps) {
  const [selectedStyle, setSelectedStyle] = useState<StickerStyle>(stickerStyles[0])
  const [selectedStamp, setSelectedStamp] = useState(stampIcons[0])

  const generate8BitSticker = (style: StickerStyle) => {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    const pixelSize = 8
    const pattern = [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 2, 2, 1, 1, 2, 2, 1],
      [1, 2, 1, 1, 1, 1, 2, 1],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0]
    ]

    const colors = ['transparent', ...style.colors]

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const colorIndex = pattern[y][x]
        if (colorIndex > 0) {
          ctx.fillStyle = colors[colorIndex]
          ctx.fillRect(
            x * pixelSize * 3,
            y * pixelSize * 3,
            pixelSize * 3,
            pixelSize * 3
          )
        }
      }
    }

    ctx.font = 'bold 48px monospace'
    ctx.fillStyle = colors[1]
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(style.character, 100, 100)

    return canvas.toDataURL()
  }

  const generate8BitStamp = (stamp: typeof stampIcons[0]) => {
    const canvas = document.createElement('canvas')
    canvas.width = 150
    canvas.height = 150
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.fillStyle = stamp.color
    ctx.fillRect(10, 10, 130, 130)

    ctx.fillStyle = '#1D3557'
    ctx.fillRect(15, 15, 120, 120)

    ctx.fillStyle = stamp.color
    ctx.font = 'bold 64px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(stamp.name.charAt(0), 75, 75)

    for (let i = 0; i < 4; i++) {
      const x = 20 + (i % 2) * 90
      const y = 20 + Math.floor(i / 2) * 90
      ctx.fillRect(x, y, 10, 10)
    }

    return canvas.toDataURL()
  }

  const handleSelectSticker = () => {
    const stickerData = generate8BitSticker(selectedStyle)
    onStickerSelect(stickerData)
  }

  const handleSelectStamp = () => {
    const stampData = generate8BitStamp(selectedStamp)
    onStickerSelect(stampData)
  }

  return (
    <Card className="p-4">
      <Label className="text-base font-semibold mb-4 block">8-Bit Stickers & Stamps</Label>
      
      <Tabs defaultValue="stickers" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="stickers">Mario Stickers</TabsTrigger>
          <TabsTrigger value="stamps">Power Stamps</TabsTrigger>
        </TabsList>

        <TabsContent value="stickers" className="mt-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {stickerStyles.map((style) => (
              <button
                key={style.name}
                onClick={() => setSelectedStyle(style)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedStyle.name === style.name
                    ? 'border-[oklch(0.75_0.18_85)] bg-[oklch(0.75_0.18_85_/_0.1)]'
                    : 'border-border hover:border-[oklch(0.70_0.24_190)]'
                }`}
              >
                <div className="text-3xl mb-1">{style.character}</div>
                <div className="text-xs font-semibold truncate">{style.name}</div>
                <div className="flex gap-1 mt-1 justify-center">
                  {style.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
          
          <div className="bg-muted rounded-lg p-4 mb-4 flex items-center justify-center min-h-[150px]">
            <img
              src={generate8BitSticker(selectedStyle)}
              alt={selectedStyle.name}
              className="max-w-full h-auto pixel-pop"
            />
          </div>

          <Button
            onClick={handleSelectSticker}
            className="w-full bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)]"
          >
            Add {selectedStyle.name} Sticker
          </Button>
        </TabsContent>

        <TabsContent value="stamps" className="mt-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {stampIcons.map((stamp) => {
              const Icon = stamp.icon
              return (
                <button
                  key={stamp.name}
                  onClick={() => setSelectedStamp(stamp)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedStamp.name === stamp.name
                      ? 'border-[oklch(0.70_0.24_190)] bg-[oklch(0.70_0.24_190_/_0.1)]'
                      : 'border-border hover:border-[oklch(0.65_0.15_155)]'
                  }`}
                >
                  <Icon size={32} weight="fill" style={{ color: stamp.color }} className="mx-auto mb-1" />
                  <div className="text-xs font-semibold">{stamp.name}</div>
                </button>
              )
            })}
          </div>

          <div className="bg-muted rounded-lg p-4 mb-4 flex items-center justify-center min-h-[150px]">
            <img
              src={generate8BitStamp(selectedStamp)}
              alt={selectedStamp.name}
              className="max-w-full h-auto pixel-pop"
            />
          </div>

          <Button
            onClick={handleSelectStamp}
            className="w-full bg-[oklch(0.70_0.24_190)] text-white hover:bg-[oklch(0.75_0.26_190)]"
          >
            Add {selectedStamp.name} Stamp
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
