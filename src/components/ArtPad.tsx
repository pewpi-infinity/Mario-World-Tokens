import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Palette, Eraser, TrashSimple, PaintBrush, CheckCircle } from '@phosphor-icons/react'

interface ArtPadProps {
  onSave: (imageData: string) => void
  currentDrawing?: string
}

export function ArtPad({ onSave, currentDrawing }: ArtPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#FFD700')
  const [brushSize, setBrushSize] = useState([5])
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush')
  const [hasDrawing, setHasDrawing] = useState(false)

  const colors = [
    { name: 'Gold', value: '#FFD700' },
    { name: 'Red', value: '#E63946' },
    { name: 'Blue', value: '#457B9D' },
    { name: 'Green', value: '#2A9D8F' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' }
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = 300

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (currentDrawing) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        setHasDrawing(true)
      }
      img.src = currentDrawing
    }
  }, [currentDrawing])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineWidth = brushSize[0]
    ctx.lineCap = 'round'
    ctx.strokeStyle = tool === 'eraser' ? '#1a1a2e' : color
    ctx.lineTo(x, y)
    ctx.stroke()

    setHasDrawing(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawing(false)
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL('image/png')
    onSave(imageData)
  }

  return (
    <Card className="p-4 border-2 border-border">
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <PaintBrush size={20} weight="fill" />
          Art Pad - Add Signature or Drawing
        </Label>

        <canvas
          ref={canvasRef}
          className="w-full border-2 border-muted-foreground/30 rounded-lg cursor-crosshair touch-none"
          style={{ height: '300px' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={tool === 'brush' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('brush')}
              className={tool === 'brush' ? 'bg-primary' : ''}
            >
              <PaintBrush size={16} weight="fill" />
              Brush
            </Button>
            <Button
              variant={tool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('eraser')}
              className={tool === 'eraser' ? 'bg-primary' : ''}
            >
              <Eraser size={16} weight="fill" />
              Eraser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              className="text-destructive"
            >
              <TrashSimple size={16} weight="fill" />
              Clear
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Colors</Label>
              {tool === 'brush' && (
                <span className="text-xs text-muted-foreground">Selected: {colors.find(c => c.value === color)?.name}</span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    setColor(c.value)
                    setTool('brush')
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c.value && tool === 'brush' ? 'border-primary scale-110' : 'border-border'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Brush Size: {brushSize[0]}px</Label>
            </div>
            <Slider
              value={brushSize}
              onValueChange={setBrushSize}
              min={1}
              max={30}
              step={1}
              className="w-full"
            />
          </div>

          {hasDrawing && (
            <Button
              onClick={saveDrawing}
              className="w-full bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)]"
            >
              <CheckCircle size={20} weight="fill" />
              Attach Drawing to Coin
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
