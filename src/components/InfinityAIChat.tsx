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

const SUGGESTED_PROMPTS: Record<AIBotRole, string[]> = {
  infinity: [
    "Coordinate all bots to add a new feature",
    "Update the entire system theme",
    "Synchronize changes across all modules"
  ],
  builder: [
    "Add a new token type with custom properties",
    "Create a different character logo option",
    "Modify the minting interface layout"
  ],
  movement: [
    "Improve Mario Kart racing physics",
    "Add new character animations",
    "Create a new mini-game"
  ],
  music: [
    "Add a new instrument to the music studio",
    "Create custom sound effects",
    "Improve the collaborative recording system"
  ],
  art: [
    "Design new Mario character sprites",
    "Create custom sticker collections",
    "Add new retro game characters"
  ],
  token: [
    "Analyze my token's collectible value",
    "Suggest token upgrade strategies",
    "Track token provenance history"
  ],
  design: [
    "Change the color scheme to blue tones",
    "Redesign the treasury dashboard",
    "Create a mobile-friendly layout"
  ],
  game: [
    "Build a new game emulator",
    "Add educational rewards to games",
    "Create physics-based mini-games"
  ],
  science: [
    "Create a physics experiment module",
    "Design a chemistry lab interface",
    "Add astronomy visualizations"
  ]
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
      const conversationHistory = updatedConversation.messages.slice(-10).map(m => 
        `${m.type === 'user' ? 'User' : currentBot.name}: ${m.content}`
      ).join('\n\n')

      const contextInfo = `
Bot Identity: ${currentBot.name}
Role: ${currentBot.role}
Description: ${currentBot.description}
Capabilities: ${AI_BOT_CONFIGS[selectedBot].capabilities.join(', ')}
Permissions: ${currentBot.permissions.join(', ')}
Parent Bot: ${currentBot.parentBotId || 'None (Top-level AI)'}
Child Bots: ${childBots.map(b => b.name).join(', ') || 'None'}
`

      const prompt = window.spark.llmPrompt`You are ${currentBot.name}, an advanced conversational AI assistant within the Federal Reserve Mario token system's Infinity AI Network.

${contextInfo}

CONVERSATION HISTORY:
${conversationHistory}

NEW USER MESSAGE:
${message.trim()}

INSTRUCTIONS:
You are a highly intelligent, conversational AI that grows smarter through each interaction. Your responses should:

1. **Be Conversational**: Talk naturally like an expert friend helping the user. Don't use numbered lists unless specifically helpful. Use natural paragraphs.

2. **Show Intelligence**: Demonstrate deep understanding of your domain (${AI_BOT_CONFIGS[selectedBot].capabilities.slice(0, 3).join(', ')}). Reference previous conversation points to show you're learning and remembering.

3. **Provide Actionable Guidance**: When the user wants to build or change something, give specific, practical advice. If you had the permissions listed above, explain what you would do.

4. **Coordinate When Needed**: If the request spans multiple AI domains, mention which other bots in the network would help (${Object.values(AI_BOT_CONFIGS).filter(c => c.bot.id !== currentBot.id).slice(0, 3).map(c => c.bot.name).join(', ')}).

5. **Grow Through Conversation**: Reference things the user mentioned earlier. Build on previous topics. Show that each conversation makes you more knowledgeable about their specific needs and preferences.

6. **Be Helpful, Not Mechanical**: Avoid robotic phrases like "I'm here to help" or "How can I assist you today". Instead, directly engage with what they're asking.

Respond now in a natural, intelligent, conversational way that demonstrates you understand both the technical depth and the user's intent:`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini')

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
      <DialogContent className="max-w-[100vw] sm:max-w-[98vw] h-[100dvh] sm:h-[95vh] p-0 flex flex-col bg-gradient-to-br from-[oklch(0.22_0.03_285)] to-[oklch(0.18_0.02_290)] border-2 border-[oklch(0.75_0.18_85)] overflow-hidden">
        <div className="p-3 sm:p-4 md:p-6 pb-2 flex-shrink-0 border-b border-[oklch(0.35_0.05_285)]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-[oklch(0.75_0.18_85)] flex items-center gap-2">
              <Infinity weight="fill" className="text-xl sm:text-2xl md:text-3xl flex-shrink-0" />
              <span className="truncate">Infinity AI Network</span>
            </DialogTitle>
            <DialogDescription className="text-[oklch(0.65_0.02_280)] text-xs sm:text-sm">
              Hierarchical AI assistants with specialized read/write permissions
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:w-64 flex-shrink-0">
                <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-[oklch(0.75_0.18_85)] flex items-center gap-2">
                      <GitBranch weight="fill" />
                      AI Bot Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="space-y-2 max-h-[60vh] lg:max-h-none overflow-y-auto">
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
                  </CardContent>
                </Card>
              </div>

              <div className="flex-1 min-w-0">
                <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
                  <CardHeader className="pb-3 border-b border-[oklch(0.35_0.05_285)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-[oklch(0.75_0.18_85)] flex items-center justify-center text-[oklch(0.15_0.02_280)] flex-shrink-0">
                          {BOT_ICONS[selectedBot]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg text-white truncate">{currentBot.name}</CardTitle>
                          <p className="text-xs text-[oklch(0.65_0.02_280)] truncate">{currentBot.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
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

                  <div className="p-4 max-h-[50vh] overflow-y-auto overflow-x-hidden" ref={scrollRef} style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="space-y-4">
                      {currentConversation.messages.length === 0 && (
                        <div className="text-center py-8 text-[oklch(0.65_0.02_280)]">
                          <Robot size={48} weight="fill" className="mx-auto mb-4 opacity-50" />
                          <p className="text-sm">Start a conversation with {currentBot.name}</p>
                          <p className="text-xs mt-2 opacity-75">This AI can help you with:</p>
                          <div className="flex flex-wrap justify-center gap-2 mt-3 mb-4">
                            {AI_BOT_CONFIGS[selectedBot].capabilities.slice(0, 3).map((cap) => (
                              <Badge key={cap} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs mt-4 mb-2 opacity-75">Try asking:</p>
                          <div className="flex flex-col gap-2 max-w-md mx-auto">
                            {SUGGESTED_PROMPTS[selectedBot].map((prompt) => (
                              <Button
                                key={prompt}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setMessage(prompt)
                                }}
                                className="text-xs text-left h-auto py-2 px-3 bg-[oklch(0.20_0.02_280)] border-[oklch(0.35_0.05_285)] text-white hover:bg-[oklch(0.25_0.03_285)] hover:text-[oklch(0.75_0.18_85)] justify-start whitespace-normal"
                              >
                                {prompt}
                              </Button>
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
                  </div>

                  <div className="p-4 border-t border-[oklch(0.35_0.05_285)]">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
