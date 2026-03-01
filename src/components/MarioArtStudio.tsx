import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { 
  PaintBrush, 
  Eraser, 
  DownloadSimple,
  Palette,
  Square,
  Circle,
  Sticker
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MarioArtStudioProps {
  open: boolean
  onClose: () => void
}

interface Pixel {
  x: number
  y: number
  color: string
}

export function MarioArtStudio({ open, onClose }: MarioArtStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('#FF0000')
  const [brushSize, setBrushSize] = useState([8])
  const [tool, setTool] = useState<'brush' | 'eraser' | 'fill'>('brush')
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)

  const pixelSize = 8
  const canvasWidth = 800
  const canvasHeight = 600

  const marioColors = [
    '#FF0000', '#0000FF', '#FFFF00', '#FFA500', '#8B4513', '#FFD700',
    '#00FF00', '#FF69B4', '#800080', '#000000', '#FFFFFF', '#808080',
    '#FF1493', '#00FFFF', '#32CD32', '#FF4500'
  ]

  const marioStickers = [
    { id: 'mario', name: '🍄 Mario', data: generateMarioPixels() },
    { id: 'luigi', name: '👾 Luigi', data: generateLuigiPixels() },
    { id: 'bowser', name: '🐢 Bowser', data: generateBowserPixels() },
    { id: 'peach', name: '👑 Peach', data: generatePeachPixels() },
    { id: 'toad', name: '🍄 Toad', data: generateToadPixels() },
    { id: 'yoshi', name: '🦎 Yoshi', data: generateYoshiPixels() },
    { id: 'wario', name: '💛 Wario', data: generateWarioPixels() },
    { id: 'waluigi', name: '💜 Waluigi', data: generateWaluigiPixels() },
    { id: 'donkey', name: '🦍 Donkey Kong', data: generateDonkeyKongPixels() },
    { id: 'koopa', name: '🐢 Koopa Troopa', data: generateKoopaPixels() },
    { id: 'goomba', name: '🍄 Goomba', data: generateGoombaPixels() },
    { id: 'boo', name: '👻 Boo', data: generateBooPixels() },
    { id: 'coin', name: '🟡 Coin', data: generateCoinPixels() },
    { id: 'star', name: '⭐ Star Power', data: generateStarPixels() },
    { id: 'mushroom', name: '🍄 Super Mushroom', data: generateMushroomPixels() },
    { id: 'fireflower', name: '🌻 Fire Flower', data: generateFireFlowerPixels() },
    { id: 'blueshell', name: '🐚 Blue Shell', data: generateBlueShellPixels() },
    { id: 'questionblock', name: '❓ Question Block', data: generateQuestionBlockPixels() }
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    for (let x = 0; x < canvasWidth; x += pixelSize) {
      for (let y = 0; y < canvasHeight; y += pixelSize) {
        ctx.strokeStyle = '#E0E0E0'
        ctx.lineWidth = 0.5
        ctx.strokeRect(x, y, pixelSize, pixelSize)
      }
    }

    pixels.forEach(pixel => {
      ctx.fillStyle = pixel.color
      ctx.fillRect(pixel.x, pixel.y, brushSize[0], brushSize[0])
    })
  }, [pixels, brushSize])

  const drawPixel = (x: number, y: number) => {
    const snappedX = Math.floor(x / pixelSize) * pixelSize
    const snappedY = Math.floor(y / pixelSize) * pixelSize

    if (tool === 'eraser') {
      setPixels(prev => prev.filter(p => !(p.x === snappedX && p.y === snappedY)))
    } else if (tool === 'brush') {
      setPixels(prev => {
        const filtered = prev.filter(p => !(p.x === snappedX && p.y === snappedY))
        return [...filtered, { x: snappedX, y: snappedY, color: currentColor }]
      })
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    drawPixel(x, y)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    drawPixel(x, y)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const placeSticker = (stickerData: Pixel[], x: number, y: number) => {
    const offsetPixels = stickerData.map(p => ({
      x: p.x + x,
      y: p.y + y,
      color: p.color
    }))
    
    setPixels(prev => {
      const existingCoords = new Set(prev.map(p => `${p.x},${p.y}`))
      const filtered = prev.filter(p => 
        !offsetPixels.some(op => op.x === p.x && op.y === p.y)
      )
      return [...filtered, ...offsetPixels]
    })
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedSticker) return

    const sticker = marioStickers.find(s => s.id === selectedSticker)
    if (!sticker) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / pixelSize) * pixelSize
    const y = Math.floor((e.clientY - rect.top) / pixelSize) * pixelSize

    placeSticker(sticker.data, x, y)
    setSelectedSticker(null)
    toast.success(`${sticker.name} placed!`)
  }

  const clearCanvas = () => {
    setPixels([])
    toast.info('Canvas cleared')
  }

  const downloadArt = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mario-art-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('🎨 Art downloaded!')
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.18_0.02_290)] border-2 border-[oklch(0.75_0.18_85)]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-[oklch(0.75_0.18_85)] flex items-center gap-3 pixel-font">
            🎨 MARIO ART STUDIO
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)] p-4">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                onMouseDown={selectedSticker ? handleCanvasClick : handleMouseDown}
                onMouseMove={selectedSticker ? undefined : handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="border-4 border-[oklch(0.75_0.18_85)] cursor-crosshair bg-white mx-auto"
                style={{ imageRendering: 'pixelated', maxWidth: '100%', height: 'auto' }}
              />
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)] p-4">
              <Label className="text-[oklch(0.75_0.18_85)] font-bold mb-3 block">Tools</Label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  onClick={() => { setTool('brush'); setSelectedSticker(null) }}
                  className={tool === 'brush' ? 'bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)]' : 'bg-[oklch(0.28_0.04_285)]'}
                >
                  <PaintBrush weight="fill" />
                </Button>
                <Button
                  onClick={() => { setTool('eraser'); setSelectedSticker(null) }}
                  className={tool === 'eraser' ? 'bg-[oklch(0.58_0.24_330)] text-white' : 'bg-[oklch(0.28_0.04_285)]'}
                >
                  <Eraser weight="fill" />
                </Button>
                <Button
                  onClick={() => { setTool('fill'); setSelectedSticker(null) }}
                  className={tool === 'fill' ? 'bg-[oklch(0.70_0.24_190)] text-white' : 'bg-[oklch(0.28_0.04_285)]'}
                >
                  <Palette weight="fill" />
                </Button>
              </div>

              <Label className="text-[oklch(0.75_0.18_85)] mb-2 block">Brush Size: {brushSize[0]}px</Label>
              <Slider
                value={brushSize}
                onValueChange={setBrushSize}
                min={4}
                max={32}
                step={4}
                className="mb-4"
              />

              <Label className="text-[oklch(0.75_0.18_85)] font-bold mb-2 block">Mario Colors</Label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {marioColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-full aspect-square rounded border-4 ${
                      currentColor === color ? 'border-white' : 'border-[oklch(0.35_0.05_285)]'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <Label className="text-[oklch(0.75_0.18_85)] font-bold mb-2 block">8-Bit Characters</Label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {marioStickers.map(sticker => (
                  <Button
                    key={sticker.id}
                    onClick={() => {
                      setSelectedSticker(sticker.id)
                      setTool('brush')
                      toast.info(`Click canvas to place ${sticker.name}`)
                    }}
                    className={`text-xs h-auto py-2 ${
                      selectedSticker === sticker.id 
                        ? 'bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)]' 
                        : 'bg-[oklch(0.28_0.04_285)] text-white'
                    }`}
                  >
                    {sticker.name}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={downloadArt}
                  className="w-full bg-[oklch(0.65_0.15_155)] text-white"
                >
                  <DownloadSimple weight="fill" className="mr-2" />
                  Download Art
                </Button>
                <Button
                  onClick={clearCanvas}
                  variant="outline"
                  className="w-full border-[oklch(0.35_0.05_285)]"
                >
                  Clear Canvas
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function generateMarioPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '   RRRRR   ',
    '  RRRRRRRR ',
    '  BBB##B#  ',
    ' B#B##B### ',
    ' B#BB##B###',
    ' B###BBB## ',
    '   ##B##   ',
    '  OOOOOO   ',
    ' ORRORRROO ',
    'OORRROORROO',
    '##ORRROO## ',
    '###OOOO### ',
    ' ##    ##  '
  ]
  
  const colors: Record<string, string> = {
    'R': '#FF0000',
    'B': '#964B00',
    '#': '#FFD700',
    'O': '#0000FF'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateLuigiPixels(): Pixel[] {
  const pixels = generateMarioPixels()
  return pixels.map(p => ({
    ...p,
    color: p.color === '#FF0000' ? '#00FF00' : p.color
  }))
}

function generateBowserPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '  OOOO  ',
    ' O####O ',
    'O#YY#YYO',
    'O##YY##O',
    'O######O',
    ' ORRRRO ',
    '  RRRR  ',
    ' GG  GG '
  ]
  
  const colors: Record<string, string> = {
    'O': '#FFA500',
    '#': '#228B22',
    'Y': '#FFFF00',
    'R': '#FF0000',
    'G': '#808080'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generatePeachPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '  YYYY  ',
    ' YYYYYY ',
    ' PPP#PP ',
    ' P#P#P# ',
    '  PPP   ',
    ' MMMMMM ',
    '  M  M  ',
    ' WW  WW '
  ]
  
  const colors: Record<string, string> = {
    'Y': '#FFD700',
    'P': '#FFB6C1',
    '#': '#0000FF',
    'M': '#FF69B4',
    'W': '#FFFFFF'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateToadPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    ' RRRRRR ',
    'RWRWRWRW',
    'RPPPPPRR',
    ' P##P## ',
    ' PPPPPP ',
    '  BBBB  ',
    ' BB  BB ',
    'WW    WW'
  ]
  
  const colors: Record<string, string> = {
    'R': '#FF0000',
    'W': '#FFFFFF',
    'P': '#FFD700',
    '#': '#000000',
    'B': '#0000FF'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateYoshiPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '  GGGG  ',
    ' GGG#GG ',
    'GGGGG#GG',
    'GWWGGGG ',
    'GRRGGG  ',
    ' GGGG   ',
    '  OO    '
  ]
  
  const colors: Record<string, string> = {
    'G': '#32CD32',
    '#': '#000000',
    'W': '#FFFFFF',
    'R': '#FF0000',
    'O': '#FFA500'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateCoinPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    ' YYYYY ',
    'YYYYYYY',
    'YY#O#YY',
    'YYO#OYY',
    'YY#O#YY',
    'YYYYYYY',
    ' YYYYY '
  ]
  
  const colors: Record<string, string> = {
    'Y': '#FFD700',
    '#': '#000000',
    'O': '#FFA500'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateStarPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '   Y   ',
    '  YYY  ',
    ' YYYYY ',
    'YYYYYYY',
    ' YY YY ',
    ' Y   Y '
  ]
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (char === 'Y') {
        pixels.push({ x: x * 8, y: y * 8, color: '#FFFF00' })
      }
    })
  })
  
  return pixels
}

function generateWarioPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '   YYYY   ',
    '  YYYYYY  ',
    '  PPP##P  ',
    ' P#P##P## ',
    ' P#PP##P##',
    ' P###PPP## ',
    '   ##P##   ',
    '  PPPPPP   ',
    ' PYYPPYYP ',
    'PYYYYYYPP',
    '##PYYPP## ',
    '###PPPP### '
  ]
  
  const colors: Record<string, string> = {
    'Y': '#FFFF00',
    'P': '#964B00',
    '#': '#FFD700'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateWaluigiPixels(): Pixel[] {
  const pixels = generateWarioPixels()
  return pixels.map(p => ({
    ...p,
    color: p.color === '#FFFF00' ? '#800080' : p.color
  }))
}

function generateDonkeyKongPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '  BBBBBB  ',
    ' BB####BB ',
    'BB##EE##BB',
    'BB#EEEE#BB',
    'BBEEEEEEEE',
    ' BB####BB ',
    '  BBBBBB  ',
    ' RR    RR '
  ]
  
  const colors: Record<string, string> = {
    'B': '#8B4513',
    '#': '#000000',
    'E': '#FFD700',
    'R': '#FF0000'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateKoopaPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '  GGGG  ',
    ' GGGGGG ',
    'GG##GG##',
    'GG####GG',
    ' YYYYYY ',
    ' YOYOYY ',
    '  YYYY  ',
    ' WW  WW '
  ]
  
  const colors: Record<string, string> = {
    'G': '#00FF00',
    '#': '#000000',
    'Y': '#FFD700',
    'O': '#FFA500',
    'W': '#FFFFFF'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateGoombaPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '  BBBB  ',
    ' BBBBBB ',
    'BB####BB',
    'BB#WW#BB',
    'BBBBBBBB',
    'BB####BB',
    'BBBBBBBB',
    ' WW  WW '
  ]
  
  const colors: Record<string, string> = {
    'B': '#8B4513',
    '#': '#000000',
    'W': '#FFFFFF'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateBooPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '  WWWWW  ',
    ' WWWWWWW ',
    'WWWWWWWWW',
    'WW##W##WW',
    'WW#WW#WWW',
    'WWWWWWWWW',
    'WW#####WW',
    ' WWWWWWW ',
    '  W W W  '
  ]
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (char === 'W') {
        pixels.push({ x: x * 8, y: y * 8, color: '#FFFFFF' })
      } else if (char === '#') {
        pixels.push({ x: x * 8, y: y * 8, color: '#000000' })
      }
    })
  })
  
  return pixels
}

function generateMushroomPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '  RRRR  ',
    ' RWRWRW ',
    'RWRWRWRW',
    'RRRRRRRR',
    ' YYYYYY ',
    ' YY##YY ',
    '  YYYY  ',
    '   YY   '
  ]
  
  const colors: Record<string, string> = {
    'R': '#FF0000',
    'W': '#FFFFFF',
    'Y': '#FFD700',
    '#': '#000000'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateFireFlowerPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    ' R  O  R ',
    'RYY YY YR',
    ' RYYOYYRO',
    '  YYYYYYY ',
    '   GGGG  ',
    '   GGGG  ',
    '  GGGGGG ',
    '  GG  GG '
  ]
  
  const colors: Record<string, string> = {
    'R': '#FF0000',
    'O': '#FFA500',
    'Y': '#FFFF00',
    'G': '#00FF00'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateBlueShellPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    '  BBBB  ',
    ' BBBBBB ',
    'BBWWWWBB',
    'BBWBBWBB',
    'BBBBBBBB',
    ' BBBBBB ',
    '  BBBB  ',
    '  W  W  '
  ]
  
  const colors: Record<string, string> = {
    'B': '#0000FF',
    'W': '#FFFFFF'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}

function generateQuestionBlockPixels(): Pixel[] {
  const pixels: Pixel[] = []
  const pattern = [
    'YYYYYYYY',
    'Y######Y',
    'Y##??##Y',
    'Y#????#Y',
    'Y##??##Y',
    'Y###?##Y',
    'Y######Y',
    'YYYYYYYY'
  ]
  
  const colors: Record<string, string> = {
    'Y': '#FFD700',
    '#': '#FFA500',
    '?': '#FFFFFF'
  }
  
  pattern.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (colors[char]) {
        pixels.push({ x: x * 8, y: y * 8, color: colors[char] })
      }
    })
  })
  
  return pixels
}
