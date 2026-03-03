import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarioCoin, ContentType } from '@/lib/types'
import { MusicNotes, Image, VideoCamera, PenNib, Users, FileText, Link, Sticker, Sparkle } from '@phosphor-icons/react'
import { FileUploadPanel } from '@/components/FileUploadPanel'
import { ArtPad } from '@/components/ArtPad'
import { MarioStickers } from '@/components/MarioStickers'
import { AIChatAssistant } from '@/components/AIChatAssistant'
import { InfinitySpiritGenerator } from '@/components/InfinitySpiritGenerator'
import { InfinityAIChat } from '@/components/InfinityAIChat'
import { toast } from 'sonner'
import { playCoinSound } from '@/lib/sounds'

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
  const [uploadedImage, setUploadedImage] = useState<{ data: string; fileName: string } | null>(null)
  const [uploadedVideo, setUploadedVideo] = useState<{ data: string; fileName: string } | null>(null)
  const [drawing, setDrawing] = useState('')
  const [stickers, setStickers] = useState<string[]>([])
  const [isMinting, setIsMinting] = useState(false)
  const [showInfinitySpiritGenerator, setShowInfinitySpiritGenerator] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)

  const handleGenerateSuggestions = async () => {
    if (!description.trim()) {
      toast.error('Add a description first to get AI suggestions')
      return
    }

    setIsGeneratingSuggestions(true)
    try {
      const prompt = window.spark.llmPrompt`You are an AI assistant helping users mint valuable Mario coins in the Federal Reserve Mario system.

Based on this token description: "${description}"
Content type: ${contentType}
Title: ${title || 'Not provided yet'}

Provide 3 helpful, specific suggestions to improve this token:
1. Content enhancement suggestion
2. Value positioning suggestion  
3. Additional element to add (sticker, art, link, etc.)

Format as a JSON object with a "suggestions" array of 3 concise strings.`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const parsed = JSON.parse(response)
      
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        setAiSuggestions(parsed.suggestions)
        toast.success('AI suggestions generated!')
      }
    } catch (error) {
      toast.error('Failed to generate suggestions')
      console.error('AI suggestion error:', error)
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  const handleMint = async () => {
    setIsMinting(true)

    try {
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

      playCoinSound()
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
      setAiSuggestions([])
    } catch (error) {
      toast.error('Minting failed')
    } finally {
      setIsMinting(false)
    }
  }

  const isValid = value && parseFloat(value) > 0 && title && description

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[98vw] sm:max-w-4xl h-[95vh] p-0 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 pb-2 border-b border-border flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-2xl font-bold pixel-font flex items-center justify-between">
                <span>MINT NEW MARIO COIN</span>
                <Button
                  onClick={() => setShowAIChat(true)}
                  size="sm"
                  variant="outline"
                  className="ml-2 text-xs sm:text-sm"
                >
                  ♾️ AI Help
                </Button>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Create your own currency backed by creative content. You are the mint!
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 min-h-0">
            <div className="space-y-4 sm:space-y-6">
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
            <Button
              onClick={handleGenerateSuggestions}
              disabled={!description.trim() || isGeneratingSuggestions}
              size="sm"
              variant="outline"
              className="mt-2 text-xs bg-gradient-to-r from-[oklch(0.75_0.18_85)] to-[oklch(0.70_0.24_190)] text-[oklch(0.15_0.02_280)] hover:opacity-90 border-none"
              type="button"
            >
              <Sparkle size={16} weight="fill" className="mr-2" />
              {isGeneratingSuggestions ? 'Generating...' : '✨ Get AI Suggestions'}
            </Button>
            {aiSuggestions.length > 0 && (
              <div className="mt-3 p-3 sm:p-4 bg-gradient-to-br from-[oklch(0.75_0.18_85)]/10 to-[oklch(0.70_0.24_190)]/10 border-2 border-[oklch(0.75_0.18_85)]/30 rounded-lg">
                <p className="text-sm font-semibold text-[oklch(0.75_0.18_85)] mb-2 flex items-center gap-2">
                  <Sparkle size={16} weight="fill" />
                  AI Suggestions to Enhance Your Token:
                </p>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  {aiSuggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[oklch(0.75_0.18_85)] font-bold mt-0.5">{i + 1}.</span>
                      <span className="text-foreground">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
                  Content URL
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
                  Link to content (Spotify, YouTube, social media, etc.)
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
                  toast.success('🎨 Drawing attached to coin!')
                }}
                currentDrawing={drawing}
              />
              {drawing && (
                <div className="mt-4 p-3 bg-[oklch(0.75_0.18_85)]/10 border-2 border-[oklch(0.75_0.18_85)] rounded-lg">
                  <p className="text-sm font-semibold text-[oklch(0.75_0.18_85)] flex items-center gap-2">
                    <PenNib size={16} weight="fill" />
                    Drawing is attached and ready to mint!
                  </p>
                </div>
              )}
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

            </div>
          </div>

          <div className="flex-shrink-0 p-4 sm:p-6 pt-3 border-t border-border bg-background/80 backdrop-blur-sm">
            <div className="flex gap-2 sm:gap-3">
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
                className="flex-1 bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)] h-10 sm:h-12 text-sm sm:text-lg font-bold"
                type="button"
              >
                {isMinting ? 'Minting...' : 'Mint Coin'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InfinityAIChat
        open={showAIChat}
        onClose={() => setShowAIChat(false)}
        initialBot="token"
      />

      <InfinitySpiritGenerator
        open={showInfinitySpiritGenerator}
        onClose={() => setShowInfinitySpiritGenerator(false)}
      />
    </>
  )
}
