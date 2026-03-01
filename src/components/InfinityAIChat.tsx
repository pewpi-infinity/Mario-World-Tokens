import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChatCircleDots,
  PaperPlaneTilt,
  Robot,
  Lightning,
  GitBranch,
  Code,
  Palette,
  MusicNotes,
  GameController,
  Flask,
  Infinity
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { AIBot, AIBotRole, AIMessage, AIConversation } from '@/lib/types'
import { AI_BOT_CONFIGS, getBotById, getBotsByParent, formatBotSystemPrompt } from '@/lib/infinity-ai'

interface InfinityAIChatProps {
  open: boolean
  onClose: () => void
  initialBot?: AIBotRole
}

const BOT_ICONS: Record<AIBotRole, React.ReactNode> = {
  infinity: <Infinity size={20} weight="fill" />,
  builder: <Code size={20} weight="fill" />,
  movement: <GameController size={20} weight="fill" />,
  music: <MusicNotes size={20} weight="fill" />,
  art: <Palette size={20} weight="fill" />,
  token: <Lightning size={20} weight="fill" />,
  design: <Palette size={20} weight="fill" />,
  game: <GameController size={20} weight="fill" />,
  science: <Flask size={20} weight="fill" />
}

export function InfinityAIChat({ open, onClose, initialBot = 'builder' }: InfinityAIChatProps) {
  const [selectedBot, setSelectedBot] = useState<AIBotRole>(initialBot)
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversations, setConversations] = useKV<Record<string, AIConversation>>('ai-conversations', {})
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentUser] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`)

  const currentBot = AI_BOT_CONFIGS[selectedBot].bot
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
        conversationHistory: updatedConversation.messages.slice(-5),
        botCapabilities: AI_BOT_CONFIGS[selectedBot].capabilities
      })

      const prompt = spark.llmPrompt`${systemPrompt}

User Message: ${message.trim()}

Please provide a helpful, specific response that aligns with your role as ${currentBot.name}. If the request requires file modifications, explain what you would change and why. If you need to coordinate with other AI bots, mention which ones and what they would handle.`

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

      toast.success(`${currentBot.name} responded!`)
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

  const childBots = getBotsByParent(currentBot.id)
  const parentBot = currentBot.parentBotId ? getBotById(currentBot.parentBotId) : null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] sm:max-w-4xl h-[95vh] p-0 flex flex-col bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.18_0.02_290)] border-2 border-[oklch(0.75_0.18_85)]">
        <div className="p-4 sm:p-6 pb-2 flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-[oklch(0.75_0.18_85)] flex items-center gap-2">
              <Infinity weight="fill" className="text-2xl sm:text-3xl" />
              <span>Infinity AI Network</span>
            </DialogTitle>
            <DialogDescription className="text-[oklch(0.65_0.02_280)] text-sm">
              Hierarchical AI assistants with specialized read/write permissions
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 flex-1 overflow-hidden px-4 sm:px-6 pb-4 sm:pb-6 min-h-0">
          <div className="w-full sm:w-64 flex-shrink-0 min-h-0 flex flex-col">
            <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)] h-full flex flex-col min-h-0">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm text-[oklch(0.75_0.18_85)] flex items-center gap-2">
                  <GitBranch weight="fill" />
                  AI Bot Network
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {Object.values(AI_BOT_CONFIGS).map((config) => (
                      <Button
                        key={config.bot.id}
                        onClick={() => setSelectedBot(config.bot.role)}
                        variant={selectedBot === config.bot.role ? 'default' : 'ghost'}
                        className={`w-full justify-start text-left h-auto py-3 px-3 ${
                          selectedBot === config.bot.role
                            ? 'bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)]'
                            : 'text-white hover:bg-[oklch(0.25_0.03_285)]'
                        }`}
                      >
                        <div className="flex items-start gap-2 w-full">
                          <div className="flex-shrink-0 mt-0.5">
                            {BOT_ICONS[config.bot.role]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{config.bot.name}</div>
                            <div className="text-xs opacity-80 line-clamp-2">{config.bot.description}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {config.bot.permissions.slice(0, 2).map((perm) => (
                                <Badge
                                  key={perm}
                                  variant="secondary"
                                  className="text-[10px] px-1 py-0"
                                >
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)] flex-1 flex flex-col overflow-hidden min-h-0">
              <CardHeader className="pb-3 border-b border-[oklch(0.35_0.05_285)] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[oklch(0.75_0.18_85)] flex items-center justify-center text-[oklch(0.15_0.02_280)]">
                      {BOT_ICONS[selectedBot]}
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg text-white">{currentBot.name}</CardTitle>
                      <p className="text-xs text-[oklch(0.65_0.02_280)]">{currentBot.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {currentBot.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {(parentBot || childBots.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[oklch(0.35_0.05_285)]">
                    {parentBot && (
                      <div className="text-xs text-[oklch(0.65_0.02_280)]">
                        Reports to: <Badge variant="outline" className="ml-1">{parentBot.name}</Badge>
                      </div>
                    )}
                    {childBots.length > 0 && (
                      <div className="text-xs text-[oklch(0.65_0.02_280)]">
                        Manages: {childBots.map(bot => (
                          <Badge key={bot.id} variant="outline" className="ml-1">{bot.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>

              <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollRef}>
                <div className="space-y-4">
                  {currentConversation.messages.length === 0 && (
                    <div className="text-center py-8 text-[oklch(0.65_0.02_280)]">
                      <Robot size={48} weight="fill" className="mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Start a conversation with {currentBot.name}</p>
                      <p className="text-xs mt-2 opacity-75">This AI can help you with:</p>
                      <div className="flex flex-wrap justify-center gap-2 mt-3">
                        {AI_BOT_CONFIGS[selectedBot].capabilities.slice(0, 3).map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.type === 'user'
                            ? 'bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)]'
                            : 'bg-[oklch(0.25_0.03_285)] text-white'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {msg.type === 'bot' && (
                            <div className="flex-shrink-0 mt-0.5">
                              {BOT_ICONS[selectedBot]}
                            </div>
                          )}
                          <div className="flex-1 text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                        </div>
                        <div className="text-xs opacity-60 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[oklch(0.25_0.03_285)] text-white rounded-lg p-3 flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_85)] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-[oklch(0.35_0.05_285)] flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Ask ${currentBot.name} for help...`}
                    className="flex-1 bg-[oklch(0.15_0.02_280)] border-[oklch(0.35_0.05_285)] text-white placeholder:text-[oklch(0.45_0.02_280)] text-sm"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    className="bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)] px-4"
                  >
                    <PaperPlaneTilt weight="fill" size={20} />
                  </Button>
                </div>
                <div className="text-xs text-[oklch(0.55_0.02_280)] mt-2 flex items-center gap-1">
                  <Lightning size={12} weight="fill" />
                  Press Enter to send • This AI has {currentBot.permissions.length} permissions
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
