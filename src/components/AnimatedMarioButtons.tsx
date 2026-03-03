import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { soundEffects } from '@/lib/sounds'

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
  label: string
  action: () => void
}

export function AnimatedMarioButtons(props: AnimatedMarioButtonsProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null)
  const [hitButton, setHitButton] = useState<number | null>(null)
  const [poppedEmoji, setPoppedEmoji] = useState<{ emoji: string; index: number } | null>(null)

  const playBrickSound = useCallback(() => {
    soundEffects.playBrickBreak()
  }, [])

  const buttons: ButtonData[] = [
    { emoji: '🟡', label: 'Mint', action: () => props.onMintToken() },
    { emoji: '🎵', label: 'Music', action: () => setActiveDialog('musicChoice') },
    { emoji: '👽', label: 'Create', action: () => props.onCreationZone() },
    { emoji: '♾️', label: 'AI', action: () => props.onAIAssistant() },
    { emoji: '🧲', label: 'Memory', action: () => setActiveDialog('memoryPull') },
    { emoji: '⚪', label: 'Upgrade', action: () => setActiveDialog('upgrade') },
    { emoji: '🕹️', label: 'Jump', action: () => setActiveDialog('valueJump') },
    { emoji: '🎬', label: 'Clip', action: () => props.onVideoClip() },
    { emoji: '📽️', label: 'Film', action: () => props.onFilmRolling() },
    { emoji: '👻', label: 'Power', action: () => props.onSuperPower() },
    { emoji: '🤑', label: 'Share', action: () => setActiveDialog('share') },
    { emoji: '🌻', label: 'Fire', action: () => setActiveDialog('firePower') },
    { emoji: '⭐', label: 'Living', action: () => props.onLivingToken() },
    { emoji: '🍄', label: 'Double', action: () => props.onDoubleUp() },
  ]

  const handleButtonClick = (index: number) => {
    playBrickSound()
    setHitButton(index)
    setPoppedEmoji({ emoji: buttons[index].emoji, index })
    
    setTimeout(() => {
      setHitButton(null)
      buttons[index].action()
      
      setTimeout(() => {
        setPoppedEmoji(null)
      }, 500)
    }, 300)
  }

  return (
    <>
      <div className="w-full overflow-x-auto px-2 sm:px-4">
        <div className="flex gap-2 sm:gap-3 justify-center py-4 min-w-max">
          {buttons.map((btn, idx) => (
            <div key={idx} className="relative flex items-center justify-center">
              <AnimatePresence>
                {poppedEmoji?.index === idx && (
                  <motion.div
                    initial={{ y: 0, opacity: 0, scale: 0 }}
                    animate={{ y: -40, opacity: 1, scale: 1.5 }}
                    exit={{ y: -70, opacity: 0, scale: 0.5 }}
                    className="absolute -top-12 text-3xl sm:text-4xl z-30"
                  >
                    {poppedEmoji.emoji}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => handleButtonClick(idx)}
                className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-all cursor-pointer overflow-hidden"
                style={{
                  background: hitButton === idx 
                    ? 'oklch(0.48 0.12 40)'
                    : 'linear-gradient(135deg, oklch(0.60 0.15 47) 0%, oklch(0.55 0.13 45) 100%)',
                  borderRadius: '3px',
                  boxShadow: hitButton === idx 
                    ? 'inset 0 2px 4px oklch(0 0 0 / 0.5)' 
                    : '0 4px 0 oklch(0.45 0.12 40), inset 0 -2px 0 oklch(0.40 0.10 38), inset 0 2px 0 oklch(0.70 0.17 50)',
                  border: '2px solid oklch(0.40 0.10 38)',
                }}
                animate={{
                  y: hitButton === idx ? 4 : 0,
                }}
                whileHover={{ 
                  scale: 1.05,
                  background: 'oklch(0.65 0.17 48)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0" style={{
                  background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, oklch(0 0 0 / 0.08) 3px, oklch(0 0 0 / 0.08) 4px), repeating-linear-gradient(90deg, transparent 0px, transparent 3px, oklch(0 0 0 / 0.08) 3px, oklch(0 0 0 / 0.08) 4px)',
                  pointerEvents: 'none'
                }}></div>
                <span 
                  className="relative z-10 text-xl sm:text-2xl transition-opacity duration-200"
                  style={{
                    opacity: hitButton === idx ? 0 : 0
                  }}
                >
                  {btn.emoji}
                </span>
                {hitButton !== idx && (
                  <span className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl">
                    🧱
                  </span>
                )}
              </motion.button>
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
