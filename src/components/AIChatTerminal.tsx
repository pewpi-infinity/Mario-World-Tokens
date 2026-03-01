import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  ChatCircleDots,
  PaperPlaneTilt,
  X,
  Minus,
  Robot,
  Lightning
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { AIBotRole, AIMessage, AIConversation } from '@/lib/types'
import { AI_BOT_CONFIGS, formatBotSystemPrompt } from '@/lib/infinity-ai'

interface AIChatTerminalProps {
  botRole: AIBotRole
  context?: string
  className?: string
}

export function AIChatTerminal({ botRole, context, className = '' }: AIChatTerminalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversations, setConversations] = useKV<Record<string, AIConversation>>('ai-conversations', {})
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentUser] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`)

  const currentBot = AI_BOT_CONFIGS[botRole].bot
  const conversationId = `${currentUser}-${currentBot.id}`
  const currentConversation = conversations?.[conversationId] || {
    id: conversationId,
    botId: currentBot.id,
    userId: currentUser,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentConversation.messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      botId: currentBot.id,
      userId: currentUser,
      content: message.trim(),
      timestamp: Date.now(),
      type: 'user'
    }

    const updatedConversation: AIConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      updatedAt: Date.now()
    }

    setConversations((current) => ({
      ...(current || {}),
      [conversationId]: updatedConversation
    }))

    setMessage('')
    setIsTyping(true)

    try {
      const systemPrompt = formatBotSystemPrompt(currentBot, {
        userMessage: message.trim(),
        conversationHistory: updatedConversation.messages.slice(-5).map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        botCapabilities: AI_BOT_CONFIGS[botRole].capabilities,
        permissions: currentBot.permissions,
        context: context || 'General assistance'
      })

      const prompt = spark.llmPrompt`${systemPrompt}

Context: ${context || 'User is interacting with the Federal Reserve Mario system'}

User Message: ${message.trim()}

You are ${currentBot.name} helping with this page. Provide helpful, specific guidance on how to use the features or make changes. Be concise and actionable.`

      const response = await spark.llm(prompt, 'gpt-4o-mini')

      const botMessage: AIMessage = {
        id: `msg-${Date.now()}-bot`,
        botId: currentBot.id,
        content: response,
        timestamp: Date.now(),
        type: 'bot'
      }

      setConversations((current) => ({
        ...(current || {}),
        [conversationId]: {
          ...updatedConversation,
          messages: [...updatedConversation.messages, botMessage],
          updatedAt: Date.now()
        }
      }))
    } catch (error) {
      toast.error('Failed to get response from AI')
      console.error('AI error:', error)
    } finally {
      setIsTyping(false)
    }
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
        className={`fixed bottom-4 right-4 z-50 bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)] shadow-lg rounded-full w-14 h-14 flex items-center justify-center ${className}`}
        title={`Chat with ${currentBot.name}`}
      >
        <ChatCircleDots weight="fill" size={24} />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-md shadow-2xl border-2 border-[oklch(0.75_0.18_85)] bg-[oklch(0.18_0.02_280)] ${
        isMinimized ? 'h-auto' : 'h-[500px] max-h-[80vh]'
      } flex flex-col ${className}`}
    >
      <CardHeader className="pb-3 border-b border-[oklch(0.35_0.05_285)] flex-shrink-0 bg-gradient-to-r from-[oklch(0.75_0.18_85)] to-[oklch(0.70_0.24_190)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Robot weight="fill" size={20} className="text-[oklch(0.15_0.02_280)]" />
            <CardTitle className="text-sm text-[oklch(0.15_0.02_280)]">
              {currentBot.name}
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-[oklch(0.15_0.02_280)] text-[oklch(0.75_0.18_85)]">
              AI
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
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 p-3 min-h-0 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-3" ref={scrollRef}>
                {currentConversation.messages.length === 0 && (
                  <div className="text-center py-4 text-[oklch(0.65_0.02_280)]">
                    <Robot size={32} weight="fill" className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Ask {currentBot.name} for help</p>
                    <p className="text-[10px] mt-1 opacity-75">
                      {AI_BOT_CONFIGS[botRole].capabilities.slice(0, 2).join(' • ')}
                    </p>
                  </div>
                )}

                {currentConversation.messages.map((msg) => (
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
                      <span className="text-[10px]">Thinking...</span>
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
                placeholder="Ask for help..."
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
            <div className="text-[10px] text-[oklch(0.55_0.02_280)] mt-1 flex items-center gap-1">
              <Lightning size={10} weight="fill" />
              Press Enter to send
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
