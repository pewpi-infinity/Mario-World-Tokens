import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Star, Crown, CirclesFour, Coin, Lightning, Heart, Skull, Fire, Ghost, Flame } from '@phosphor-icons/react'

interface RetroStickersProps {
  onStickerSelect: (stickerData: string) => void
}

interface StickerCharacter {
  name: string
  character: string
  colors: string[]
  category: 'mario' | 'sonic' | 'classic' | 'power-ups'
}

const retroCharacters: StickerCharacter[] = [
  { name: 'Mario', character: 'M', colors: ['#E63946', '#1D3557', '#FFD700'], category: 'mario' },
  { name: 'Luigi', character: 'L', colors: ['#2A9D8F', '#1D3557', '#FFD700'], category: 'mario' },
  { name: 'Peach', character: 'P', colors: ['#FFC0CB', '#FFD700', '#E63946'], category: 'mario' },
  { name: 'Toad', character: 'T', colors: ['#E63946', '#FFFFFF', '#FFD700'], category: 'mario' },
  { name: 'Yoshi', character: 'Y', colors: ['#2A9D8F', '#E63946', '#FFFFFF'], category: 'mario' },
  { name: 'Bowser', character: 'B', colors: ['#E63946', '#264653', '#FFD700'], category: 'mario' },
  { name: 'Wario', character: 'W', colors: ['#FFD60A', '#6A1B9A', '#FFFFFF'], category: 'mario' },
  
  { name: 'Sonic', character: 'S', colors: ['#0066CC', '#FF0000', '#FFD700'], category: 'sonic' },
  { name: 'Tails', character: 'T', colors: ['#FFA500', '#FFFFFF', '#FF0000'], category: 'sonic' },
  { name: 'Knuckles', character: 'K', colors: ['#E63946', '#FFFFFF', '#FFD700'], category: 'sonic' },
  { name: 'Shadow', character: 'S', colors: ['#000000', '#E63946', '#FFD700'], category: 'sonic' },
  { name: 'Amy', character: 'A', colors: ['#FF69B4', '#FF0000', '#FFFFFF'], category: 'sonic' },
  { name: 'Eggman', character: 'E', colors: ['#FF0000', '#000000', '#FFD700'], category: 'sonic' },
  
  { name: 'Pac-Man', character: '◕', colors: ['#FFD700', '#000000', '#E63946'], category: 'classic' },
  { name: 'Link', character: 'L', colors: ['#2A9D8F', '#FFD700', '#FFFFFF'], category: 'classic' },
  { name: 'Kirby', character: 'K', colors: ['#FFC0CB', '#E63946', '#FF69B4'], category: 'classic' },
  { name: 'Donkey Kong', character: 'D', colors: ['#964B00', '#E63946', '#FFD700'], category: 'classic' },
  { name: 'Mega Man', character: 'M', colors: ['#0066CC', '#7EC8E3', '#FFD700'], category: 'classic' },
  { name: 'Pikachu', character: 'P', colors: ['#FFD700', '#E63946', '#000000'], category: 'classic' },
  
  { name: 'Mushroom', character: '🍄', colors: ['#E63946', '#FFFFFF', '#FFD700'], category: 'power-ups' },
  { name: 'Star', character: '⭐', colors: ['#FFD700', '#FFA500', '#FFFFFF'], category: 'power-ups' },
  { name: 'Fire Flower', character: '🌻', colors: ['#FFA500', '#E63946', '#2A9D8F'], category: 'power-ups' },
  { name: 'Ring', character: '⭕', colors: ['#FFD700', '#FFA500', '#FFED4E'], category: 'power-ups' },
  { name: 'Emerald', character: '💎', colors: ['#2A9D8F', '#00FF00', '#FFD700'], category: 'power-ups' },
  { name: 'Coin', character: '🟡', colors: ['#FFD700', '#FFA500', '#FF8800'], category: 'power-ups' }
]

const stampIcons = [
  { name: 'Star', icon: Star, color: '#FFD700' },
  { name: 'Crown', icon: Crown, color: '#FFD700' },
  { name: 'Power', icon: CirclesFour, color: '#E63946' },
  { name: 'Coin', icon: Coin, color: '#FFD700' },
  { name: 'Lightning', icon: Lightning, color: '#457B9D' },
  { name: 'Heart', icon: Heart, color: '#E63946' },
  { name: 'Skull', icon: Skull, color: '#FFFFFF' },
  { name: 'Fire', icon: Fire, color: '#FF4500' },
  { name: 'Ghost', icon: Ghost, color: '#87CEEB' },
  { name: 'Flame', icon: Flame, color: '#FFA500' }
]

export function RetroStickers({ onStickerSelect }: RetroStickersProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<StickerCharacter>(retroCharacters[0])
  const [selectedStamp, setSelectedStamp] = useState(stampIcons[0])
  const [filter, setFilter] = useState<string>('all')

  const filteredCharacters = filter === 'all' 
    ? retroCharacters 
    : retroCharacters.filter(c => c.category === filter)

  const generate8BitSticker = (character: StickerCharacter) => {
    const canvas = document.createElement('canvas')
    canvas.width = 240
    canvas.height = 240
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    const pixelSize = 10
    const patterns = {
      mario: [
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 2, 2, 1, 1, 2, 2, 1, 0],
        [0, 1, 2, 1, 1, 1, 1, 2, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      sonic: [
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [1, 1, 2, 2, 1, 1, 1, 1, 1, 0],
        [1, 1, 2, 2, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
        [1, 3, 3, 1, 0, 0, 1, 3, 3, 1]
      ],
      classic: [
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 2, 1, 1, 1, 1, 2, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      powerup: [
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 2, 2, 2, 1, 1, 0, 0],
        [0, 1, 2, 2, 2, 2, 2, 1, 0, 0],
        [1, 1, 2, 2, 2, 2, 2, 1, 1, 0],
        [1, 1, 2, 2, 2, 2, 2, 1, 1, 0],
        [0, 1, 2, 2, 2, 2, 2, 1, 0, 0],
        [0, 1, 1, 2, 2, 2, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 0]
      ]
    }

    const pattern = character.category === 'power-ups' ? patterns.powerup :
                   character.category === 'sonic' ? patterns.sonic :
                   character.category === 'classic' ? patterns.classic : patterns.mario

    const colors = ['transparent', ...character.colors]

    const offsetX = (canvas.width - pattern[0].length * pixelSize * 2) / 2
    const offsetY = (canvas.height - pattern.length * pixelSize * 2) / 2

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const colorIndex = pattern[y][x]
        if (colorIndex > 0) {
          ctx.fillStyle = colors[colorIndex]
          ctx.fillRect(
            offsetX + x * pixelSize * 2,
            offsetY + y * pixelSize * 2,
            pixelSize * 2,
            pixelSize * 2
          )
        }
      }
    }

    ctx.font = 'bold 56px monospace'
    ctx.fillStyle = colors[1]
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(character.character, canvas.width / 2, canvas.height / 2)

    return canvas.toDataURL()
  }

  const generate8BitStamp = (stamp: typeof stampIcons[0]) => {
    const canvas = document.createElement('canvas')
    canvas.width = 180
    canvas.height = 180
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.fillStyle = stamp.color
    ctx.fillRect(10, 10, 160, 160)

    ctx.fillStyle = '#1D3557'
    ctx.fillRect(15, 15, 150, 150)

    ctx.fillStyle = stamp.color
    ctx.font = 'bold 72px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(stamp.name.charAt(0), 90, 90)

    for (let i = 0; i < 4; i++) {
      const x = 25 + (i % 2) * 110
      const y = 25 + Math.floor(i / 2) * 110
      ctx.fillRect(x, y, 12, 12)
    }

    return canvas.toDataURL()
  }

  const handleSelectSticker = () => {
    const stickerData = generate8BitSticker(selectedCharacter)
    onStickerSelect(stickerData)
  }

  const handleSelectStamp = () => {
    const stampData = generate8BitStamp(selectedStamp)
    onStickerSelect(stampData)
  }

  return (
    <Card className="p-4">
      <Label className="text-base font-semibold mb-4 block">8-Bit Retro Stickers & Stamps</Label>
      
      <Tabs defaultValue="stickers" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="stickers">Retro Characters</TabsTrigger>
          <TabsTrigger value="stamps">Power Stamps</TabsTrigger>
        </TabsList>

        <TabsContent value="stickers" className="mt-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)]' : ''}
            >
              All
            </Button>
            <Button
              variant={filter === 'mario' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('mario')}
              className={filter === 'mario' ? 'bg-[oklch(0.58_0.24_330)] text-white' : ''}
            >
              Mario
            </Button>
            <Button
              variant={filter === 'sonic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('sonic')}
              className={filter === 'sonic' ? 'bg-[oklch(0.70_0.24_190)] text-white' : ''}
            >
              Sonic
            </Button>
            <Button
              variant={filter === 'classic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('classic')}
              className={filter === 'classic' ? 'bg-[oklch(0.65_0.15_155)] text-white' : ''}
            >
              Classic
            </Button>
            <Button
              variant={filter === 'power-ups' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('power-ups')}
              className={filter === 'power-ups' ? 'bg-[oklch(0.72_0.20_50)] text-white' : ''}
            >
              Power-Ups
            </Button>
          </div>

          <ScrollArea className="h-64">
            <div className="grid grid-cols-3 gap-3">
              {filteredCharacters.map((character) => (
                <button
                  key={`${character.name}-${character.category}`}
                  onClick={() => setSelectedCharacter(character)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedCharacter.name === character.name && selectedCharacter.category === character.category
                      ? 'border-[oklch(0.75_0.18_85)] bg-[oklch(0.75_0.18_85_/_0.1)] scale-105'
                      : 'border-border hover:border-[oklch(0.70_0.24_190)] hover:scale-105'
                  }`}
                >
                  <div className="text-3xl mb-1">{character.character}</div>
                  <div className="text-xs font-semibold truncate">{character.name}</div>
                  <div className="flex gap-1 mt-1 justify-center">
                    {character.colors.map((color, i) => (
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
          </ScrollArea>
          
          <div className="bg-muted rounded-lg p-4 mb-4 flex items-center justify-center min-h-[200px]">
            <img
              src={generate8BitSticker(selectedCharacter)}
              alt={selectedCharacter.name}
              className="max-w-full h-auto pixel-pop"
            />
          </div>

          <Button
            onClick={handleSelectSticker}
            className="w-full bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)]"
          >
            Add {selectedCharacter.name} Sticker ✨
          </Button>
        </TabsContent>

        <TabsContent value="stamps" className="mt-4">
          <ScrollArea className="h-64">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {stampIcons.map((stamp) => {
                const Icon = stamp.icon
                return (
                  <button
                    key={stamp.name}
                    onClick={() => setSelectedStamp(stamp)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedStamp.name === stamp.name
                        ? 'border-[oklch(0.70_0.24_190)] bg-[oklch(0.70_0.24_190_/_0.1)] scale-105'
                        : 'border-border hover:border-[oklch(0.65_0.15_155)] hover:scale-105'
                    }`}
                  >
                    <Icon size={36} weight="fill" style={{ color: stamp.color }} className="mx-auto mb-1" />
                    <div className="text-xs font-semibold">{stamp.name}</div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>

          <div className="bg-muted rounded-lg p-4 mb-4 flex items-center justify-center min-h-[200px]">
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
            Add {selectedStamp.name} Stamp ⭐
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
