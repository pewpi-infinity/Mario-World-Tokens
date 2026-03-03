import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  PaperPlaneTilt,
  Robot,
  Palette,
  FileText,
  Paperclip,
  Lightning,
  X,
  Minus
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  type: 'user' | 'ai'
  timestamp: number
}

interface HomepageAIDesignerProps {
  className?: string
}

export function HomepageAIDesigner({ className = '' }: HomepageAIDesignerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; content: string }>>([])
  const [messages, setMessages] = useKV<Message[]>('homepage-ai-messages', [])
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (prefilledMessage?: string) => {
    const contentToSend = (prefilledMessage ?? message).trim()
    if (!contentToSend) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: contentToSend,
      type: 'user',
      timestamp: Date.now()
    }

    setMessages((current) => [...(current || []), userMessage])
    setMessage('')
    setIsTyping(true)

    try {
      const conversationHistory = (messages || []).slice(-6).map(m => 
        `${m.type === 'user' ? 'User' : 'InfinityBrain'}: ${m.content}`
      ).join('\n\n')
      const fileContext = attachedFiles.length > 0
        ? attachedFiles
            .map((file, index) => `File ${index + 1} (${file.name}):\n${file.content}`)
            .join('\n\n')
        : 'No attached files.'

      const prompt = window.spark.llmPrompt`You are InfinityBrain, an ELITE conversational page and research AI for the Federal Reserve Mario system. You have full design/write permissions to design and iterate the homepage and research workflow.

You are a HIGHLY INTELLIGENT, CONVERSATIONAL AI that grows smarter through each interaction. You're like GPT but specialized for homepage design plus iterative research generation.

CONVERSATION HISTORY:
${conversationHistory}

NEW USER MESSAGE:
${contentToSend}

ATTACHED FILE CONTEXT:
${fileContext}

YOUR CORE ABILITIES:
1. **Design Visual Layouts**: Suggest specific page structures, component arrangements, grid systems, spacing, and responsive designs
2. **Write Compelling Copy**: Create headlines, descriptions, calls-to-action, and engaging microcopy that fits the Mario theme
3. **Suggest Color Schemes**: Recommend specific color palettes with oklch values that match the Mario aesthetic
4. **Structure Content**: Organize information hierarchy, create intuitive navigation, and improve content flow
5. **Create Design Elements**: Suggest animations, hover states, interactive elements, and visual treatments
6. **Improve UX**: Identify usability issues and recommend specific improvements to user workflows
7. **Mario Theming**: Apply authentic Mario universe aesthetics while maintaining professional functionality
8. **Research Iteration**: Build iterative research-paper outputs based on the inquiry and any attached file context

CURRENT CONTEXT:
The homepage shows the Federal Reserve Mario token minting system with:
- Treasury section showing user's minted coins
- Marketplace for token transfers
- Charts displaying analytics
- Global ledger of all transactions
- Various action buttons for minting, art creation, music studios, etc.
- User flow goal: 🔎 search → 🟡 token → 👑 website → 🤓 research → 🦾 tools → ⚙️ development → 💰 value → 💲 assets

RESPONSE STYLE:
- Be conversational and enthusiastic like a creative partner
- Provide SPECIFIC, ACTIONABLE suggestions (exact colors, layouts, copy, etc.)
- Reference the conversation history to build on previous ideas
- Ask clarifying questions when you need more details
- Show you're thinking creatively: "What if we...", "I'd suggest...", "Here's how I'd structure this..."
- Keep responses concise but packed with useful details (3-5 sentences)
- Use Mario-themed language and emojis when appropriate 🟡🍄⭐
- If the inquiry is about research, output this structure:
  # Header
  ## Subjects
  ## Summary
  ## Body
  ## Subcategories
  ## Subsections
  ## Next Iteration Actions

When users ask for design help, they want YOU to be their creative partner - suggesting specific implementations, writing actual copy they can use, and helping them build something amazing.

Respond now with specific, creative suggestions:`

      const response = await window.spark.llm(prompt, 'gpt-4o')

      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        content: response,
        type: 'ai',
        timestamp: Date.now()
      }

      setMessages((current) => [...(current || []), aiMessage])
      toast.success('Homepage AI responded!')
    } catch (error) {
      toast.error('Failed to get response from Homepage AI')
      console.error('Homepage AI error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleAttachFiles: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    Promise.all(
      files.slice(0, 3).map(async (file) => ({
        name: file.name,
        content: (await file.text()).slice(0, 2000)
      }))
    )
      .then((nextFiles) => {
        setAttachedFiles(nextFiles)
        toast.success(`Attached ${nextFiles.length} file${nextFiles.length > 1 ? 's' : ''} for iteration context`)
      })
      .catch(() => toast.error('Failed to attach file context'))
      .finally(() => {
        if (fileInputRef.current) fileInputRef.current.value = ''
      })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed top-20 right-4 z-40 bg-gradient-to-r from-[oklch(0.75_0.18_85)] to-[oklch(0.70_0.24_190)] text-[oklch(0.15_0.02_280)] hover:opacity-90 shadow-lg rounded-full px-4 py-2 flex items-center gap-2 ${className}`}
        title="Homepage AI Designer"
      >
        <Palette weight="fill" size={20} />
        <span className="text-sm font-bold hidden sm:inline">Page Designer</span>
      </Button>
    )
  }

  return (
    <Card
      className={`fixed top-20 right-4 z-40 w-[calc(100vw-2rem)] max-w-md shadow-2xl border-2 border-[oklch(0.75_0.18_85)] bg-[oklch(0.18_0.02_280)] ${
        isMinimized ? 'h-auto' : 'h-[500px] max-h-[calc(100vh-6rem)]'
      } flex flex-col ${className}`}
    >
      <CardHeader className="pb-3 border-b border-[oklch(0.35_0.05_285)] flex-shrink-0 bg-gradient-to-r from-[oklch(0.75_0.18_85)] to-[oklch(0.70_0.24_190)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette weight="fill" size={20} className="text-[oklch(0.15_0.02_280)]" />
            <CardTitle className="text-sm text-[oklch(0.15_0.02_280)]">
              InfinityBrain Page + Research AI
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-[oklch(0.15_0.02_280)] text-[oklch(0.75_0.18_85)]">
              Full Access
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.85_0.20_85)]"
            >
              <Minus size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.85_0.20_85)]"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-[oklch(0.15_0.02_280)]/80 mt-1">
          Iterative page building + research paper generation
        </p>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 p-3 min-h-0 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-3" ref={scrollRef}>
                {(messages || []).length === 0 && (
                  <div className="text-center py-4 text-[oklch(0.65_0.02_280)]">
                    <Robot size={32} weight="fill" className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold mb-1">InfinityBrain</p>
                    <p className="text-[10px] opacity-75">
                      Build the page, generate structured research, and iterate with file context
                    </p>
                    <div className="mt-3 space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMessage('Suggest improvements to the homepage layout')}
                        className="text-xs w-full bg-[oklch(0.20_0.02_280)] border-[oklch(0.35_0.05_285)] text-white hover:bg-[oklch(0.25_0.03_285)]"
                      >
                        Suggest layout improvements
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMessage('Write engaging copy for the header')}
                        className="text-xs w-full bg-[oklch(0.20_0.02_280)] border-[oklch(0.35_0.05_285)] text-white hover:bg-[oklch(0.25_0.03_285)]"
                      >
                        Write header copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMessage('Design a welcome message for new users')}
                        className="text-xs w-full bg-[oklch(0.20_0.02_280)] border-[oklch(0.35_0.05_285)] text-white hover:bg-[oklch(0.25_0.03_285)]"
                      >
                        Create welcome message
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMessage('Generate an InfinityBrain research paper from this inquiry with Header, Subjects, Summary, Body, Subcategories, and Subsections')}
                        className="text-xs w-full bg-[oklch(0.20_0.02_280)] border-[oklch(0.35_0.05_285)] text-white hover:bg-[oklch(0.25_0.03_285)]"
                      >
                        Build structured research paper
                      </Button>
                    </div>
                  </div>
                )}

                {(messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-2 text-xs ${
                        msg.type === 'user'
                          ? 'bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)]'
                          : 'bg-[oklch(0.25_0.03_285)] text-white'
                      }`}
                    >
                      {msg.type === 'ai' && (
                        <div className="flex items-center gap-1 mb-1">
                          <Palette size={12} weight="fill" />
                          <span className="text-[10px] font-semibold opacity-80">Homepage Designer</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                      <div className="text-[10px] opacity-60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[oklch(0.25_0.03_285)] text-white rounded-lg p-2 flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px]">Designing...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <div className="p-3 border-t border-[oklch(0.35_0.05_285)] flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about homepage design..."
                className="flex-1 bg-[oklch(0.15_0.02_280)] border-[oklch(0.35_0.05_285)] text-white placeholder:text-[oklch(0.45_0.02_280)] text-xs h-8"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                size="sm"
                className="bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)] h-8 px-3"
              >
                <PaperPlaneTilt weight="fill" size={14} />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage('Continue iterating the current InfinityBrain draft and expand with deeper details and next steps')}
                disabled={isTyping}
                className="h-7 text-[10px] bg-[oklch(0.20_0.02_280)] border-[oklch(0.35_0.05_285)] text-white hover:bg-[oklch(0.25_0.03_285)]"
              >
                Continue Iteration
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping}
                className="h-7 text-[10px] bg-[oklch(0.20_0.02_280)] border-[oklch(0.35_0.05_285)] text-white hover:bg-[oklch(0.25_0.03_285)]"
              >
                <Paperclip size={10} className="mr-1" />
                Add Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json,.csv,text/*"
                multiple
                className="hidden"
                onChange={handleAttachFiles}
              />
              {attachedFiles.map((file) => (
                <Badge key={file.name} variant="secondary" className="text-[10px]">
                  <FileText size={10} className="mr-1" />
                  {file.name}
                </Badge>
              ))}
            </div>
            <div className="text-[10px] text-[oklch(0.55_0.02_280)] mt-1 flex items-center gap-1">
              <Lightning size={10} weight="fill" />
              Full page design & writing permissions
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
