import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarioCoin, ContentType } from '@/lib/types'
import { MusicNotes, Image, VideoCamera, PenNib, Users, FileText } from '@phosphor-icons/react'

export interface MintingInterfaceProps {
  open: boolean
  onClose: () => void
  onMint: (coin: MarioCoin) => void
  currentUser: string
}

const contentTypes: { value: ContentType; label: string; icon: typeof MusicNotes }[] = [
  { value: 'music', label: 'Music Notes', icon: MusicNotes },
  { value: 'video', label: 'Video Clip', icon: VideoCamera },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'poetry', label: 'Poetry', icon: PenNib },
  { value: 'clout', label: 'Clout/Fame Connection', icon: Users },
  { value: 'text', label: 'Text/Document', icon: FileText }
]

export function MintingInterface({ open, onClose, onMint, currentUser }: MintingInterfaceProps) {
  const [value, setValue] = useState('1.00')
  const [contentType, setContentType] = useState<ContentType>('music')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')

  const handleMint = () => {
    const newCoin: MarioCoin = {
      id: `mc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      value: parseFloat(value) || 0,
      mintedAt: Date.now(),
      mintedBy: currentUser,
      content: {
        type: contentType,
        title,
        description,
        url: url || undefined
      },
      transferHistory: []
    }

    onMint(newCoin)
    
    setValue('1.00')
    setContentType('music')
    setTitle('')
    setDescription('')
    setUrl('')
  }

  const isValid = value && parseFloat(value) > 0 && title && description

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pixel-font">MINT NEW MARIO COIN</DialogTitle>
          <DialogDescription>
            Create your own currency backed by creative content. You are the mint!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div>
            <Label htmlFor="value" className="text-base font-semibold">USD Value</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">$</span>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="text-2xl font-bold pl-8 h-14"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enter the USD-equivalent value of this coin</p>
          </div>

          <div>
            <Label htmlFor="content-type" className="text-base font-semibold">Content Type</Label>
            <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
              <SelectTrigger id="content-type" className="mt-2 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon size={18} weight="fill" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">What backs this currency?</p>
          </div>

          <div>
            <Label htmlFor="title" className="text-base font-semibold">Content Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 h-12"
              placeholder="e.g., 'Symphony No. 5' or 'Meeting with Elon Musk'"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-semibold">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 min-h-[100px]"
              placeholder="Describe what backs this coin. Include details about the content, its value, or your connection to it."
            />
          </div>

          <div>
            <Label htmlFor="url" className="text-base font-semibold">Content URL (Optional)</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-2 h-12"
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground mt-1">Link to the content (Spotify, YouTube, social media, etc.)</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMint}
              disabled={!isValid}
              className="flex-1 bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)] h-12 text-lg font-bold"
              type="button"
            >
              Mint Coin
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
