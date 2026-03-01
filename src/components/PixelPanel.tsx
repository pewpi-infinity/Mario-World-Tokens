import { PixelSettings } from '@/lib/types'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface PixelPanelProps {
  pixel: PixelSettings
  onPixelChange: (pixel: PixelSettings) => void
}

export function PixelPanel({ pixel, onPixelChange }: PixelPanelProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Pixelation: {pixel.pixelation}%</Label>
        <Slider
          value={[pixel.pixelation]}
          onValueChange={([value]) => onPixelChange({ ...pixel, pixelation: value })}
          min={0}
          max={100}
          step={1}
        />
        <p className="text-xs text-muted-foreground">
          Make it more blocky and retro
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Color Depth: {pixel.colorDepth}%</Label>
        <Slider
          value={[pixel.colorDepth]}
          onValueChange={([value]) => onPixelChange({ ...pixel, colorDepth: value })}
          min={0}
          max={100}
          step={1}
        />
        <p className="text-xs text-muted-foreground">
          Reduce the number of colors
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Dithering: {pixel.dithering}%</Label>
        <Slider
          value={[pixel.dithering]}
          onValueChange={([value]) => onPixelChange({ ...pixel, dithering: value })}
          min={0}
          max={100}
          step={1}
        />
        <p className="text-xs text-muted-foreground">
          Add retro pixel patterns
        </p>
      </div>
    </div>
  )
}
