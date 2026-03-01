import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface AnimatedMarioButtonsProps {
  onTimeCapsule: (secret: string, releaseDate: Date) => void
  onMintToken: () => void
  onUpgradeToken: (tokenId: string) => void
  onVideoClip: () => void
  onFilmRolling: () => void
  onSuperPower: () => void
  onSocialShare: (tokenId: string) => void
  onMemoryPull: (tokenId: string) => void
  onCreationZone: () => void
  onFirePower: (offerId: string) => void
  onMusicCreation: () => void
  onCollabMusic: () => void
  onValueJump: (fromValue: number, toValue: number) => void
  onLivingToken: () => void
  onDoubleUp: () => void
  onAIAssistant: () => void
}

interface ButtonData {
  emoji: string
  brick: string
  label: string
  action: () => void
}

export function AnimatedMarioButtons(props: AnimatedMarioButtonsProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null)
  const [timeCapsuleSecret, setTimeCapsuleSecret] = useState('')
  const [timeCapsuleDate, setTimeCapsuleDate] = useState('')
  const [marioPosition, setMarioPosition] = useState(-1)
  const [animatingButton, setAnimatingButton] = useState<number | null>(null)
  const [revealedBricks, setRevealedBricks] = useState<number[]>([])
  const [showBricks, setShowBricks] = useState(false)

  const buttons: ButtonData[] = [
    { emoji: '🟡', brick: '🧱', label: 'Mint Token', action: () => props.onMintToken() },
    { emoji: '🎵', brick: '🧱', label: 'Music Studio', action: () => setActiveDialog('musicChoice') },
    { emoji: '👽', brick: '🧱', label: 'Creation Zone', action: () => props.onCreationZone() },
    { emoji: '♾️', brick: '🧱', label: 'AI Network', action: () => props.onAIAssistant() },
    { emoji: '🧲', brick: '🧱', label: 'Memory Pull', action: () => setActiveDialog('memoryPull') },
    { emoji: '⚪', brick: '🧱', label: 'Upgrade Token', action: () => setActiveDialog('upgrade') },
    { emoji: '🕹️', brick: '🧱', label: 'Value Jump', action: () => setActiveDialog('valueJump') },
    { emoji: '🎬', brick: '🧱', label: 'Mario Clip', action: () => props.onVideoClip() },
    { emoji: '📽️', brick: '🧱', label: 'Film Rolling', action: () => props.onFilmRolling() },
    { emoji: '👻', brick: '🧱', label: 'Super Powers', action: () => props.onSuperPower() },
    { emoji: '🤑', brick: '🧱', label: 'Social Share', action: () => setActiveDialog('share') },
    { emoji: '🌻', brick: '🧱', label: 'Fire Power', action: () => setActiveDialog('firePower') },
    { emoji: '⭐', brick: '🧱', label: 'Living Token', action: () => props.onLivingToken() },
    { emoji: '🍄', brick: '🧱', label: 'Double Up', action: () => props.onDoubleUp() },
  ]

  const handleButtonActivate = (index: number) => {
    if (revealedBricks.includes(index)) {
      buttons[index].action()
      return
    }

    setMarioPosition(index)
    setAnimatingButton(index)

    setTimeout(() => {
      setRevealedBricks((current) => [...current, index])
      setAnimatingButton(null)
      setMarioPosition(-1)
      buttons[index].action()
    }, 800)
  }

  const handleTimeCapsuleSubmit = () => {
    if (!timeCapsuleSecret || !timeCapsuleDate) {
      toast.error('Please fill in all fields')
      return
    }
    props.onTimeCapsule(timeCapsuleSecret, new Date(timeCapsuleDate))
    setActiveDialog(null)
    setTimeCapsuleSecret('')
    setTimeCapsuleDate('')
  }

  return (
    <>
      <div className="w-full overflow-x-auto overflow-y-visible py-4 px-2">
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1 sm:gap-2 min-w-max sm:min-w-0">
          {buttons.map((btn, idx) => (
            <div key={idx} className="relative flex flex-col items-center">
              {marioPosition === idx && (
                <div
                  className="absolute -top-12 text-3xl z-20 animate-bounce"
                  style={{ animation: 'bounce 0.6s ease-in-out' }}
                >
                  🏃
                </div>
              )}

              <div className="relative">
                {!revealedBricks.includes(idx) ? (
                  <Button
                    onClick={() => handleButtonActivate(idx)}
                    className={`text-2xl sm:text-3xl md:text-4xl p-2 sm:p-3 bg-[oklch(0.45_0.08_30)] hover:bg-[oklch(0.50_0.10_30)] border-2 border-[oklch(0.35_0.06_30)] shadow-lg transition-all aspect-square flex items-center justify-center min-h-[2.5rem] sm:min-h-[3.5rem] w-full ${
                      animatingButton === idx ? 'animate-pulse scale-110' : ''
                    }`}
                    title={btn.label}
                    aria-label={btn.label}
                  >
                    <span className="leading-none block">{btn.brick}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleButtonActivate(idx)}
                    className="text-2xl sm:text-3xl md:text-4xl p-2 sm:p-3 bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] border-2 border-[oklch(0.85_0.20_85)] shadow-lg hover:shadow-xl transition-all hover:scale-110 pixel-pop aspect-square flex items-center justify-center min-h-[2.5rem] sm:min-h-[3.5rem] w-full"
                    title={btn.label}
                    aria-label={btn.label}
                  >
                    <span className="leading-none block">{btn.emoji}</span>
                  </Button>
                )}
              </div>

              {revealedBricks.includes(idx) && (
                <span className="text-[8px] sm:text-[10px] mt-1 text-[oklch(0.75_0.18_85)] font-bold text-center leading-tight max-w-[4rem] truncate">
                  {btn.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={activeDialog === 'musicChoice'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">🎵 Music Studio</DialogTitle>
            <DialogDescription>Choose your music creation mode</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button
              onClick={() => {
                setActiveDialog(null)
                props.onMusicCreation()
              }}
              className="h-16 sm:h-20 text-base sm:text-lg bg-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.75_0.26_190)]"
            >
              🎹 Solo Studio - Create Alone
            </Button>
            <Button
              onClick={() => {
                setActiveDialog(null)
                props.onCollabMusic()
              }}
              className="h-16 sm:h-20 text-base sm:text-lg bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.70_0.17_155)]"
            >
              👥 Collaborative Studio - Jam Together
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'upgrade'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">⚪ Upgrade to Platinum</DialogTitle>
            <DialogDescription>AI will analyze your token and create an upgraded version</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Select a token from your treasury to upgrade it to platinum quality
            </p>
            <Button
              onClick={() => {
                setActiveDialog(null)
                props.onUpgradeToken('selected-token')
              }}
              className="bg-[oklch(0.85_0.02_280)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.90_0.02_280)]"
            >
              Analyze & Upgrade Token
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'valueJump'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">🕹️ Value Jump & Game Builder</DialogTitle>
            <DialogDescription>Jump between denominations and build games</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Button
              onClick={() => {
                setActiveDialog(null)
                props.onValueJump(1, 100)
              }}
              className="w-full bg-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.75_0.26_190)]"
            >
              Jump $1 → $100
            </Button>
            <Button
              onClick={() => {
                setActiveDialog(null)
                props.onValueJump(1, 5)
              }}
              className="w-full bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.70_0.17_155)]"
            >
              Jump $1 → $5
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'memoryPull'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">🧲 Memory Pull</DialogTitle>
            <DialogDescription>Pull token memory to create new coin, leave platinum behind</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              This will extract the memory from your token and create a new 🟡 coin while leaving a ⚪ platinum token behind
            </p>
            <Button
              onClick={() => {
                setActiveDialog(null)
                props.onMemoryPull('selected-token')
              }}
              className="bg-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.75_0.26_190)]"
            >
              Pull Memory & Create New
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'share'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">🤑 Social Share</DialogTitle>
            <DialogDescription>Share to all synced social media</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Your token will be shared to all connected and synced social media accounts
            </p>
            <Button
              onClick={() => {
                setActiveDialog(null)
                props.onSocialShare('selected-token')
              }}
              className="bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)]"
            >
              Share Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'firePower'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">🌻 Fire Power</DialogTitle>
            <DialogDescription>Deny bad marketplace offers with Mario's fire power</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Use fire power to deny unfair or low-value offers in the marketplace
            </p>
            <Button
              onClick={() => {
                setActiveDialog(null)
                props.onFirePower('bad-offer')
              }}
              className="bg-[oklch(0.58_0.24_330)] text-white hover:bg-[oklch(0.63_0.26_330)]"
            >
              🔥 Deny Offer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
