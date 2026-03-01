import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkle, Palette, GridFour, Sticker, FloppyDisk, Download, ArrowCounterClockwise } from '@phosphor-icons/react'
import { ImageCanvas } from '@/components/ImageCanvas'
import { FilterPanel } from '@/components/FilterPanel'
import { ColorPanel } from '@/components/ColorPanel'
import { PixelPanel } from '@/components/PixelPanel'
import { StickerPanel } from '@/components/StickerPanel'
import { EditorState } from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import marioImage from '@/assets/images/Screenshot_20260225-192747.png'

const defaultState: EditorState = {
  filter: { type: 'none', intensity: 50 },
  color: { palette: 'original', hue: 0, saturation: 100, brightness: 100 },
  pixel: { pixelation: 0, colorDepth: 100, dithering: 0 },
  stickers: []
}

function App() {
  const [editorState, setEditorState] = useKV<EditorState>('pixel-perfect-state', defaultState)
  const [activeTab, setActiveTab] = useState('filters')
  
  const state = editorState || defaultState

  const handleReset = () => {
    setEditorState(defaultState)
    toast.success('Editor reset to defaults')
  }

  const handleSave = () => {
    toast.success('Editor state saved!', {
      description: 'Your edits are automatically saved'
    })
  }

  const handleExport = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `mario-edit-${Date.now()}.png`
          a.click()
          URL.revokeObjectURL(url)
          toast.success('Image downloaded!', {
            description: 'Check your downloads folder'
          })
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-primary bg-gradient-to-r from-primary via-secondary to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(1_0_0_/_0.05)_10px,oklch(1_0_0_/_0.05)_20px)]"></div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-accent p-3 rounded-lg arcade-pulse">
                <Sparkle size={40} className="text-accent-foreground" weight="fill" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg pixel-font">
                  PIXEL PERFECT
                </h1>
                <p className="text-sm md:text-base text-accent font-semibold drop-shadow">
                  Mario Photo Editor 🎮
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                <ArrowCounterClockwise size={20} weight="bold" />
                <span className="hidden md:inline ml-2">Reset</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="border-cyan text-cyan hover:bg-cyan hover:text-background"
              >
                <FloppyDisk size={20} weight="fill" />
                <span className="hidden md:inline ml-2">Save</span>
              </Button>
              <Button
                size="sm"
                onClick={handleExport}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Download size={20} weight="bold" />
                <span className="hidden md:inline ml-2">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card border-2 border-primary/30">
              <ImageCanvas
                imageSrc={marioImage}
                editorState={state}
              />
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border-2 border-secondary/30">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Tools</h2>
                {state.stickers.length > 0 && (
                  <Badge variant="outline" className="border-accent text-accent">
                    {state.stickers.length} sticker{state.stickers.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full bg-muted p-1">
                  <TabsTrigger
                    value="filters"
                    className="flex flex-col items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Sparkle size={20} weight="fill" />
                    <span className="text-xs">Filters</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="colors"
                    className="flex flex-col items-center gap-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                  >
                    <Palette size={20} weight="fill" />
                    <span className="text-xs">Colors</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pixels"
                    className="flex flex-col items-center gap-1 data-[state=active]:bg-cyan data-[state=active]:text-background"
                  >
                    <GridFour size={20} weight="fill" />
                    <span className="text-xs">Pixels</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="stickers"
                    className="flex flex-col items-center gap-1 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  >
                    <Sticker size={20} weight="fill" />
                    <span className="text-xs">Stickers</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="filters" className="mt-0">
                    <FilterPanel
                      filter={state.filter}
                      onFilterChange={(filter) =>
                        setEditorState((current) => ({ ...(current || defaultState), filter }))
                      }
                    />
                  </TabsContent>

                  <TabsContent value="colors" className="mt-0">
                    <ColorPanel
                      color={state.color}
                      onColorChange={(color) =>
                        setEditorState((current) => ({ ...(current || defaultState), color }))
                      }
                    />
                  </TabsContent>

                  <TabsContent value="pixels" className="mt-0">
                    <PixelPanel
                      pixel={state.pixel}
                      onPixelChange={(pixel) =>
                        setEditorState((current) => ({ ...(current || defaultState), pixel }))
                      }
                    />
                  </TabsContent>

                  <TabsContent value="stickers" className="mt-0">
                    <StickerPanel
                      stickers={state.stickers}
                      onStickersChange={(stickers) =>
                        setEditorState((current) => ({ ...(current || defaultState), stickers }))
                      }
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}

export default App
