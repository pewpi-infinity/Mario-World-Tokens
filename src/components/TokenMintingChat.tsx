import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Sparkle, PaperPlaneTilt, Robot } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { playCoinSound } from '@/lib/sounds'

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: number
}

interface TokenMintingChatProps {
  currentTitle: string
  currentDescription: string
  currentValue: string
  contentType: string
  onSuggestion?: (field: string, value: string) => void
}

export function TokenMintingChat({
  currentTitle,
  currentDescription,
  currentValue,
  contentType,
  onSuggestion
}: TokenMintingChatProps) {
  const [messages, setMessages] = useKV<ChatMessage[]>('token-minting-chat', [])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if ((messages || []).length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        type: 'system',
        content: "👋 Welcome to the Token Minting AI Assistant! I'm here to help you create valuable Mario tokens. Ask me anything about your token, content ideas, or how to maximize value!",
        timestamp: Date.now()
      }
      setMessages([welcomeMessage])
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages((current) => [...(current || []), userMessage])
    setInput('')
    setIsTyping(true)
    playCoinSound()

    try {
      const contextInfo = `
Current Token Details:
- Title: ${currentTitle || 'Not set yet'}
- Description: ${currentDescription || 'Not set yet'}
- Value: $${currentValue || '0.00'}
- Content Type: ${contentType}

User Question: ${input.trim()}
`

      const prompt = window.spark.llmPrompt`You are an expert AI assistant helping users mint valuable Mario tokens in the Federal Reserve Mario system. Each token is backed by creative content (music, video, art, poetry, clout connections, etc.).

${contextInfo}

Your job is to:
1. Answer the user's question helpfully and specifically
2. Suggest concrete improvements to their token (better title, description, value, content to add)
3. Be encouraging and creative
4. Keep responses concise (2-3 sentences max)

If the user asks for help with specific fields, provide actionable suggestions they can implement immediately.

Respond conversationally and enthusiastically!`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', false)

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        type: 'ai',
        content: response,
        timestamp: Date.now()
      }

      setMessages((current) => [...(current || []), aiMessage])
      playCoinSound()
    } catch (error) {
      toast.error('AI chat failed - please try again')
      console.error('Chat error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const quickPrompts = [
    "How can I make this token more valuable?",
    "Suggest a better title for my token",
    "What content should I add?",
    "Help me write a compelling description"
  ]

  const currentMessages = messages || []

  return (
    <Card className="border-2 border-[oklch(0.75_0.18_85)]/30 bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.18_0.02_280)]">
      <div className="p-3 sm:p-4 border-b border-[oklch(0.75_0.18_85)]/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.75_0.18_85)] to-[oklch(0.70_0.24_190)] flex items-center justify-center">
            <Robot size={18} weight="fill" className="text-background" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[oklch(0.75_0.18_85)] flex items-center gap-1">
              <Sparkle size={14} weight="fill" />
              Token AI Assistant
            </h3>
            <p className="text-xs text-muted-foreground">Ask me anything about your token</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[250px] sm:h-[300px]" ref={scrollRef}>
        <div className="p-3 sm:p-4 space-y-3">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.type !== 'user' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[oklch(0.75_0.18_85)] to-[oklch(0.70_0.24_190)] flex items-center justify-center flex-shrink-0">
                  {msg.type === 'system' ? (
                    <Sparkle size={12} weight="fill" className="text-background" />
                  ) : (
                    <Robot size={12} weight="fill" className="text-background" />
                  )}
                </div>
              )}
              <div
                className={`rounded-lg px-3 py-2 max-w-[85%] text-xs sm:text-sm ${
                  msg.type === 'user'
                    ? 'bg-[oklch(0.75_0.18_85)] text-background'
                    : msg.type === 'system'
                    ? 'bg-[oklch(0.70_0.24_190)]/20 text-foreground border border-[oklch(0.70_0.24_190)]/30'
                    : 'bg-card text-foreground border border-border'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <span className="text-xs opacity-60 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[oklch(0.75_0.18_85)] to-[oklch(0.70_0.24_190)] flex items-center justify-center flex-shrink-0">
                <Robot size={12} weight="fill" className="text-background" />
              </div>
              <div className="bg-card border border-border rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 sm:p-4 space-y-2 border-t border-[oklch(0.75_0.18_85)]/20">
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, i) => (
            <Button
              key={i}
              onClick={() => handleQuickPrompt(prompt)}
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2 bg-[oklch(0.75_0.18_85)]/10 border-[oklch(0.75_0.18_85)]/30 hover:bg-[oklch(0.75_0.18_85)]/20"
            >
              {prompt}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask about your token..."
            className="flex-1 h-9 text-sm"
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            size="sm"
            className="bg-gradient-to-r from-[oklch(0.75_0.18_85)] to-[oklch(0.70_0.24_190)] hover:opacity-90 h-9 px-3"
          >
            <PaperPlaneTilt size={16} weight="fill" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
