import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { playPipe } from '@/lib/sounds'
import { toast } from 'sonner'

interface WarpPipe {
  id: string
  color: 'green' | 'red' | 'blue' | 'yellow'
  label: string
  videoUrl?: string
  content?: string
}

export function WarpPipes() {
  const [selectedPipe, setSelectedPipe] = useState<WarpPipe | null>(null)

  const pipes: WarpPipe[] = [
    {
      id: '1',
      color: 'green',
      label: 'Tutorial',
      content: '🎮 Welcome to Mario World Tokens!\n\nThis is your personal Federal Reserve where YOU control the money supply. Create tokens backed by your creativity, trade them, and build value!'
    },
    {
      id: '2',
      color: 'blue',
      label: 'Features',
      content: '⭐ Key Features:\n\n🪙 Mint tokens backed by music, art, videos, poetry\n📈 Track value growth with charts\n🔄 Trade in the marketplace\n🎨 Create in art studio\n🎵 Build music in production studio\n🏁 Race and earn rewards'
    },
    {
      id: '3',
      color: 'red',
      label: 'AI Help',
      content: '🤖 AI Assistants Available:\n\n♾️ Infinity AI - General help\n🎨 Art AI - Creative guidance\n🎵 Music AI - Production tips\n🎮 Game AI - Build games\n🪙 Token AI - Minting advice'
    },
    {
      id: '4',
      color: 'yellow',
      label: 'Quick Tips',
      content: '💡 Pro Tips:\n\n• Better descriptions = Higher value\n• Add multiple content types\n• Use AI to enhance tokens\n• Trade strategically\n• Build a diverse portfolio\n• Collaborate with others'
    }
  ]

  const handlePipeClick = (pipe: WarpPipe) => {
    playPipe()
    setSelectedPipe(pipe)
    toast.success(`🟢 Entered ${pipe.color} warp pipe!`)
  }

  const pipeColors = {
    green: 'from-[oklch(0.65_0.15_155)] to-[oklch(0.55_0.12_150)]',
    blue: 'from-[oklch(0.70_0.24_190)] to-[oklch(0.60_0.20_185)]',
    red: 'from-[oklch(0.58_0.24_330)] to-[oklch(0.48_0.20_325)]',
    yellow: 'from-[oklch(0.75_0.18_85)] to-[oklch(0.65_0.15_80)]'
  }

  const pipeShadows = {
    green: 'shadow-[0_0_20px_oklch(0.65_0.15_155)]',
    blue: 'shadow-[0_0_20px_oklch(0.70_0.24_190)]',
    red: 'shadow-[0_0_20px_oklch(0.58_0.24_330)]',
    yellow: 'shadow-[0_0_20px_oklch(0.75_0.18_85)]'
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-2">
        {pipes.map((pipe) => (
          <button
            key={pipe.id}
            onClick={() => handlePipeClick(pipe)}
            className="group cursor-pointer transform transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <div className="relative">
              <div className={`
                w-full aspect-[3/4] rounded-2xl 
                bg-gradient-to-b ${pipeColors[pipe.color]}
                border-4 border-[oklch(0.15_0.02_280)]
                ${pipeShadows[pipe.color]}
                group-hover:brightness-110
                transition-all duration-200
                relative overflow-hidden
              `}>
                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl" />
                
                <div className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-[oklch(0.15_0.02_280)] to-transparent opacity-80" />
                <div className="absolute inset-x-0 top-0 h-[20%] border-b-4 border-[oklch(0.15_0.02_280)]" />
                
                <div className="absolute inset-x-0 bottom-0 h-3/4">
                  <div className="absolute inset-0 bg-[oklch(0.05_0_0)] rounded-full blur-md opacity-60 transform scale-75" />
                  
                  <div className="absolute inset-x-[10%] top-[10%] h-full rounded-t-full bg-gradient-to-b from-[oklch(0.05_0_0)] to-transparent opacity-80" />
                  
                  <div className="absolute inset-x-[15%] bottom-0 h-[60%]">
                    <div className="w-full h-full bg-[oklch(0.05_0_0)] rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_4px,oklch(0_0_0_/_0.1)_4px,oklch(0_0_0_/_0.1)_8px)]" />
                
                <div className="absolute top-[22%] left-1/2 -translate-x-1/2 w-[60%] h-[8%] bg-[oklch(0.15_0.02_280)] rounded" />
                <div className="absolute top-[32%] left-1/2 -translate-x-1/2 w-[60%] h-[8%] bg-[oklch(0.15_0.02_280)] rounded" />
              </div>
              
              <div className="mt-2 text-center">
                <p className="text-xs sm:text-sm font-bold text-foreground pixel-font">{pipe.label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selectedPipe} onOpenChange={() => setSelectedPipe(null)}>
        <DialogContent className="bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.18_0.02_280)] border-2 border-[oklch(0.75_0.18_85)]">
          {selectedPipe && (
            <Card className="bg-[oklch(0.15_0.02_280)]/50 border-[oklch(0.75_0.18_85)]/30 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-16 rounded-lg bg-gradient-to-b ${pipeColors[selectedPipe.color]} border-2 border-[oklch(0.15_0.02_280)] ${pipeShadows[selectedPipe.color]}`} />
                <div>
                  <h3 className="text-lg font-bold text-[oklch(0.75_0.18_85)] pixel-font">
                    {selectedPipe.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">Warp Pipe Info</p>
                </div>
              </div>
              
              {selectedPipe.content && (
                <div className="bg-card/50 rounded-lg p-4 border border-border">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedPipe.content}
                  </p>
                </div>
              )}
              
              {selectedPipe.videoUrl && (
                <div className="mt-4 aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={selectedPipe.videoUrl}
                    controls
                    className="w-full h-full"
                  />
                </div>
              )}
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
