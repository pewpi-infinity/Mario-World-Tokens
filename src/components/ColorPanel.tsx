import { ColorSettings, ColorPalette } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface ColorPanelProps {
  color: ColorSettings
  onColorChange: (color: ColorSettings) => void
}

const palettes: { palette: ColorPalette; label: string; emoji: string }[] = [
  { palette: 'original', label: 'Original', emoji: '🔴' },
  { palette: 'fire', label: 'Fire Mario', emoji: '🔥' },
  { palette: 'luigi', label: 'Luigi', emoji: '💚' },
  { palette: 'ice', label: 'Ice Mario', emoji: '❄️' },
  { palette: 'gold', label: 'Gold', emoji: '⭐' },
  { palette: 'monochrome', label: 'Retro', emoji: '⚫' },
]

export function ColorPanel({ color, onColorChange }: ColorPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold mb-3 block">Color Palette</Label>
        <div className="grid grid-cols-2 gap-2">
          {palettes.map((p) => (
            <Button
              key={p.palette}
              variant={color.palette === p.palette ? 'default' : 'outline'}
              className={`${
                color.palette === p.palette
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'hover:border-secondary/50'
              }`}
              onClick={() => onColorChange({ ...color, palette: p.palette })}
            >
              <span className="mr-2">{p.emoji}</span>
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label className="text-sm">Hue: {color.hue}°</Label>
          <Slider
            value={[color.hue]}
            onValueChange={([value]) => onColorChange({ ...color, hue: value })}
            min={0}
            max={360}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Saturation: {color.saturation}%</Label>
          <Slider
            value={[color.saturation]}
            onValueChange={([value]) => onColorChange({ ...color, saturation: value })}
            min={0}
            max={200}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Brightness: {color.brightness}%</Label>
          <Slider
            value={[color.brightness]}
            onValueChange={([value]) => onColorChange({ ...color, brightness: value })}
            min={0}
            max={200}
            step={1}
          />
        </div>
      </div>
    </div>
  )
}
