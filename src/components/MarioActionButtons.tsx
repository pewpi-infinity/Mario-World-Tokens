import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { MarioCoin } from '@/lib/types'

interface MarioActionButtonsProps {
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
  onValueJump: (fromValue: number, toValue: number) => void
  onLivingToken: () => void
  onDoubleUp: () => void
}

export function MarioActionButtons({
  onTimeCapsule,
  onMintToken,
  onUpgradeToken,
  onVideoClip,
  onFilmRolling,
  onSuperPower,
  onSocialShare,
  onMemoryPull,
  onCreationZone,
  onFirePower,
  onMusicCreation,
  onValueJump,
  onLivingToken,
  onDoubleUp
}: MarioActionButtonsProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null)
  const [timeCapsuleSecret, setTimeCapsuleSecret] = useState('')
  const [timeCapsuleDate, setTimeCapsuleDate] = useState('')

  const buttons = [
    { emoji: '🧱', label: 'Time Capsule', action: () => setActiveDialog('timeCapsule') },
    { emoji: '🟡', label: 'Mint Token', action: () => onMintToken() },
    { emoji: '⚪', label: 'Upgrade Token', action: () => setActiveDialog('upgrade') },
    { emoji: '🎬', label: 'Mario Clip', action: () => onVideoClip() },
    { emoji: '📽️', label: 'Film Rolling', action: () => onFilmRolling() },
    { emoji: '👻', label: 'Super Powers', action: () => onSuperPower() },
    { emoji: '🤑', label: 'Social Share', action: () => setActiveDialog('share') },
    { emoji: '🧲', label: 'Memory Pull', action: () => setActiveDialog('memoryPull') },
    { emoji: '👽', label: 'Creation Zone', action: () => onCreationZone() },
    { emoji: '🌻', label: 'Fire Power', action: () => setActiveDialog('firePower') },
    { emoji: '🎵', label: 'Music Studio', action: () => onMusicCreation() },
    { emoji: '🕹️', label: 'Value Jump', action: () => setActiveDialog('valueJump') },
    { emoji: '⭐', label: 'Living Token', action: () => onLivingToken() },
    { emoji: '🍄', label: 'Double Up', action: () => onDoubleUp() }
  ]

  const handleTimeCapsuleSubmit = () => {
    if (!timeCapsuleSecret || !timeCapsuleDate) {
      toast.error('Please fill in all fields')
      return
    }
    onTimeCapsule(timeCapsuleSecret, new Date(timeCapsuleDate))
    setActiveDialog(null)
    setTimeCapsuleSecret('')
    setTimeCapsuleDate('')
  }

  return (
    <>
      <div className="grid grid-cols-7 lg:grid-cols-14 gap-2 p-4 bg-gradient-to-r from-[oklch(0.58_0.24_330)] via-[oklch(0.65_0.25_265)] to-[oklch(0.70_0.24_190)] rounded-lg border-4 border-[oklch(0.75_0.18_85)]">
        {buttons.map((btn, idx) => (
          <Button
            key={idx}
            onClick={btn.action}
            className="text-4xl md:text-5xl p-4 md:p-6 bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] border-2 border-[oklch(0.85_0.20_85)] shadow-lg hover:shadow-xl transition-all hover:scale-110 pixel-pop aspect-square"
            title={btn.label}
          >
            {btn.emoji}
          </Button>
        ))}
      </div>

      <Dialog open={activeDialog === 'timeCapsule'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">🧱 Time Capsule</DialogTitle>
            <DialogDescription>
              Encode a secret message and set a future release date
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Secret Message</label>
              <Textarea
                value={timeCapsuleSecret}
                onChange={(e) => setTimeCapsuleSecret(e.target.value)}
                placeholder="Enter your secret message..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Release Date</label>
              <Input
                type="datetime-local"
                value={timeCapsuleDate}
                onChange={(e) => setTimeCapsuleDate(e.target.value)}
              />
            </div>
            <Button onClick={handleTimeCapsuleSubmit} className="w-full">
              Create Time Capsule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'upgrade'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">⚪ Platinum Upgrade</DialogTitle>
            <DialogDescription>
              AI will analyze your token and create an improved platinum version
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Select a token from your treasury to upgrade with AI enhancement
            </p>
            <Button onClick={() => {
              toast.info('Select a token from your treasury to upgrade')
              setActiveDialog(null)
            }}>
              Go to Treasury
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'share'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">🤑 Social Share</DialogTitle>
            <DialogDescription>
              Share your Mario Coin to all connected social media
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will share your selected token to all logged and synced social media platforms.
            </p>
            <div className="flex gap-4 justify-center">
              <div className="text-4xl">📱</div>
              <div className="text-4xl">🐦</div>
              <div className="text-4xl">📘</div>
              <div className="text-4xl">📸</div>
            </div>
            <Button onClick={() => {
              toast.success('Token shared to social media!')
              setActiveDialog(null)
            }} className="w-full">
              Share Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'memoryPull'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">🧲 Memory Pull</DialogTitle>
            <DialogDescription>
              Pull token memory to create platinum ⚪ and build new 🟡
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              This will analyze the entire token history and create a new enhanced version, leaving a platinum token behind.
            </p>
            <Button onClick={() => {
              toast.info('Processing token memory...')
              setActiveDialog(null)
            }}>
              Start Memory Pull
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'firePower'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">🌻 Fire Power</DialogTitle>
            <DialogDescription>
              Deny unfair marketplace offers with Mario fire power
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🔥</div>
            <p className="text-muted-foreground mb-4">
              Use fire power in the marketplace to reject bad deals and protect your value!
            </p>
            <Button onClick={() => {
              toast.success('Fire power activated! 🔥')
              setActiveDialog(null)
            }}>
              Activate Fire Power
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'valueJump'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">🕹️ Value Jump</DialogTitle>
            <DialogDescription>
              Jump between token values to make them more tradeable
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Move your token value strategically. Start with $1 to build acceptance before creating higher values.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 5, 10, 20, 50, 100].map(val => (
                <Button
                  key={val}
                  onClick={() => {
                    toast.success(`Token value set to $${val}`)
                    setActiveDialog(null)
                  }}
                  className="text-lg font-bold"
                >
                  ${val}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
