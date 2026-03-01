import { FilterSettings, FilterType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FilterPanelProps {
  filter: FilterSettings
  onFilterChange: (filter: FilterSettings) => void
}

const filters: { type: FilterType; label: string; description: string }[] = [
  { type: 'none', label: 'None', description: 'Original image' },
  { type: 'crt', label: 'CRT', description: 'Scan lines & glow' },
  { type: 'vhs', label: 'VHS', description: 'Retro tape look' },
  { type: 'gameboy', label: 'Game Boy', description: 'Green palette' },
  { type: 'nes', label: 'NES', description: 'Color reduction' },
  { type: 'glitch', label: 'Glitch', description: 'Digital chaos' },
  { type: 'arcade', label: 'Arcade', description: 'Bright & vibrant' },
]

export function FilterPanel({ filter, onFilterChange }: FilterPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold mb-3 block">Filter Type</Label>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-2 gap-2">
            {filters.map((f) => (
              <Button
                key={f.type}
                variant={filter.type === f.type ? 'default' : 'outline'}
                className={`h-auto flex-col items-start p-3 ${
                  filter.type === f.type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onFilterChange({ ...filter, type: f.type })}
              >
                <div className="font-bold text-sm">{f.label}</div>
                <div className="text-xs opacity-80">{f.description}</div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {filter.type !== 'none' && (
        <div className="space-y-2">
          <Label className="text-sm">Intensity: {filter.intensity}%</Label>
          <Slider
            value={[filter.intensity]}
            onValueChange={([value]) => onFilterChange({ ...filter, intensity: value })}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      )}
    </div>
  )
}
