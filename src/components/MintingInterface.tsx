import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarioCoin, ContentType } from '@/lib/types'
import { MusicNotes, Image, VideoCamera, PenNib, Users, FileText, Link, Sticker } from '@phosphor-icons/react'
import { FileUploadPanel } from '@/components/FileUploadPanel'
import { ArtPad } from '@/components/ArtPad'
import { MarioStickers } from '@/components/MarioStickers'
import { toast } from 'sonner'

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

async function moderateUrl(url: string): Promise<{ approved: boolean; reason?: string }> {
  if (!url.trim()) return { approved: true }

  try {
    const prompt = window.spark.llmPrompt`You are a content moderator for a family-friendly currency minting platform. Analyze this URL to ensure it meets safety guidelines.

Safety Guidelines (from the Bible and family values):
- NO pornography or sexual content links
- NO death, gore, or graphic violence sites
- NO hateful content or extremist sites
- NO dangerous activities or self-harm content
- NO illegal substances or activities sites
- FAMILY-FRIENDLY content only

URL to check: ${url}

Based on the URL domain and path, please respond with ONLY a JSON object in this exact format:
{
  "approved": true or false,
  "reason": "brief explanation if not approved"
}

If the URL appears safe and family-friendly (or you cannot determine from the URL alone), set approved to true. If it clearly violates guidelines, set approved to false and provide a brief reason.`

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    
    return {
      approved: result.approved === true,
      reason: result.reason || 'URL did not meet safety guidelines'
    }
  } catch (error) {
    console.error('URL moderation error:', error)
    return { approved: true }
  }
}

export function MintingInterface({ open, onClose, onMint, currentUser }: MintingInterfaceProps) {
  const [value, setValue] = useState('1.00')
  const [contentType, setContentType] = useState<ContentType>('music')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [uploadedImage, setUploadedImage] = useState<{ data: string; fileName: string } | null>(null)
  const [uploadedVideo, setUploadedVideo] = useState<{ data: string; fileName: string } | null>(null)
  const [drawing, setDrawing] = useState('')
  const [stickers, setStickers] = useState<string[]>([])
  const [isMinting, setIsMinting] = useState(false)

  const handleMint = async () => {
    setIsMinting(true)

    try {
      if (url) {
        const moderationResult = await moderateUrl(url)
        if (!moderationResult.approved) {
          toast.error(`URL moderation: ${moderationResult.reason}`)
          setIsMinting(false)
          return
        }
      }

      let data = uploadedImage?.data || uploadedVideo?.data || drawing || undefined

      const serialNumber = `MC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      const newCoin: MarioCoin = {
        id: `mc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        value: parseFloat(value) || 0,
        mintedAt: Date.now(),
        mintedBy: currentUser,
        content: {
          type: contentType,
          title,
          description,
          url: url || undefined,
          data,
          stickers: stickers.length > 0 ? stickers : undefined
        },
        transferHistory: [],
        serialNumber
      }

      onMint(newCoin)
      
      setValue('1.00')
      setContentType('music')
      setTitle('')
      setDescription('')
      setUrl('')
      setUploadedImage(null)
      setUploadedVideo(null)
      setDrawing('')
      setStickers([])
    } catch (error) {
      toast.error('Minting failed')
    } finally {
      setIsMinting(false)
    }
  }

  const isValid = value && parseFloat(value) > 0 && title && description

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="link">
                <Link size={18} weight="bold" />
                <span className="ml-2">Link</span>
              </TabsTrigger>
              <TabsTrigger value="image">
                <Image size={18} weight="fill" />
                <span className="ml-2">Image</span>
              </TabsTrigger>
              <TabsTrigger value="video">
                <VideoCamera size={18} weight="fill" />
                <span className="ml-2">Video</span>
              </TabsTrigger>
              <TabsTrigger value="art">
                <PenNib size={18} weight="fill" />
                <span className="ml-2">Art Pad</span>
              </TabsTrigger>
              <TabsTrigger value="stickers">
                <Sticker size={18} weight="fill" />
                <span className="ml-2">Stickers</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="mt-4">
              <div>
                <Label htmlFor="url" className="text-base font-semibold flex items-center gap-2">
                  <Link size={18} weight="bold" />
                  Content URL (AI Moderated)
                </Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-2 h-12"
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link to content (Spotify, YouTube, social media, etc.). AI will check for family-friendly content.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="image" className="mt-4">
              <FileUploadPanel
                type="image"
                onFileSelect={(data, fileName) => {
                  setUploadedImage({ data, fileName })
                  setUploadedVideo(null)
                  setDrawing('')
                }}
                currentFile={uploadedImage?.data}
                currentFileName={uploadedImage?.fileName}
              />
            </TabsContent>

            <TabsContent value="video" className="mt-4">
              <FileUploadPanel
                type="video"
                onFileSelect={(data, fileName) => {
                  setUploadedVideo({ data, fileName })
                  setUploadedImage(null)
                  setDrawing('')
                }}
                currentFile={uploadedVideo?.data}
                currentFileName={uploadedVideo?.fileName}
              />
            </TabsContent>

            <TabsContent value="art" className="mt-4">
              <ArtPad
                onSave={(imageData) => {
                  setDrawing(imageData)
                  setUploadedImage(null)
                  setUploadedVideo(null)
                  toast.success('Drawing saved!')
                }}
                currentDrawing={drawing}
              />
            </TabsContent>

            <TabsContent value="stickers" className="mt-4">
              <MarioStickers
                onStickerSelect={(stickerData) => {
                  setStickers((current) => [...current, stickerData])
                  toast.success('Sticker added to coin!')
                }}
              />
              {stickers.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-semibold mb-2 block">Added Stickers ({stickers.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {stickers.map((sticker, i) => (
                      <div key={i} className="relative group">
                        <img src={sticker} alt="Sticker" className="w-16 h-16 pixel-pop" />
                        <button
                          onClick={() => setStickers((current) => current.filter((_, index) => index !== i))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              type="button"
              disabled={isMinting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMint}
              disabled={!isValid || isMinting}
              className="flex-1 bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)] h-12 text-lg font-bold"
              type="button"
            >
              {isMinting ? 'Minting...' : 'Mint Coin'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
