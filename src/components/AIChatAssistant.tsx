import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkle, PaperPlaneRight, MagnifyingGlass, Image as ImageIcon, VideoCamera, Link } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
}

interface AIChatAssistantProps {
  onSuggestContent: (type: string, content: string) => void
}

export function AIChatAssistant({ onSuggestContent }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🎮 Hi! I\'m your Mario Coin AI assistant. I can help you find content, suggest ideas, search the web, and create amazing tokens! What would you like to mint today?',
      suggestions: ['Find music for a $5 coin', 'Search for art ideas', 'Suggest video content', 'Help me create poetry']
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (message?: string) => {
    const userMessage = message || input.trim()
    if (!userMessage || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const prompt = window.spark.llmPrompt`You are a creative AI assistant helping users mint Mario Coins backed by content. The user is creating a currency token and needs help finding, suggesting, or creating content.

User's request: ${userMessage}

Please respond with helpful suggestions for their token. You can:
1. Suggest content ideas based on their request
2. Recommend search queries they could use
3. Provide creative ideas for titles, descriptions, or themes
4. Suggest URL sources (YouTube, Spotify, art sites, etc.)
5. Help them brainstorm unique content that backs their currency

Be creative, enthusiastic, and Mario-themed! Use emojis. Keep responses concise (2-3 sentences max) with actionable suggestions.

Respond in JSON format:
{
  "message": "your helpful response here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "contentType": "music|video|image|poetry|text|null",
  "searchQuery": "optional search query they could use",
  "urlSuggestion": "optional URL to content"
}`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const aiResponse = JSON.parse(response)

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.message,
        suggestions: aiResponse.suggestions || []
      }

      setMessages(prev => [...prev, assistantMsg])

      if (aiResponse.urlSuggestion) {
        onSuggestContent('url', aiResponse.urlSuggestion)
      }

      if (aiResponse.searchQuery) {
        toast.success('Search Query Ready!', {
          description: `Try searching: "${aiResponse.searchQuery}"`
        })
      }

    } catch (error) {
      console.error('AI chat error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Oops! I had trouble processing that. Try asking in a different way!'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion)
  }

  const handleWebSearch = async () => {
    const query = input.trim()
    if (!query) return

    toast.info('Web Search', {
      description: `Opening search for: "${query}"`
    })

    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
  }

  return (
    <Card className="bg-gradient-to-br from-[oklch(0.70_0.24_190)] to-[oklch(0.58_0.24_330)] border-2 border-[oklch(0.75_0.18_85)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white pixel-font text-sm">
          <Sparkle size={20} weight="fill" className="text-[oklch(0.75_0.18_85)]" />
          AI ASSISTANT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block px-3 py-2 rounded-lg max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-white text-[oklch(0.15_0.02_280)]'
                      : 'bg-[oklch(0.15_0.02_280)] text-white border border-[oklch(0.75_0.18_85)]'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs mr-1 mb-1 bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] border-[oklch(0.85_0.20_85)] hover:bg-[oklch(0.85_0.20_85)]"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="text-left">
                <div className="inline-block px-3 py-2 rounded-lg bg-[oklch(0.15_0.02_280)] text-white border border-[oklch(0.75_0.18_85)]">
                  <p className="text-sm">✨ Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="bg-white text-[oklch(0.15_0.02_280)] border-[oklch(0.75_0.18_85)]"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleWebSearch}
            className="bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.75_0.15_155)]"
            disabled={isLoading || !input.trim()}
          >
            <MagnifyingGlass size={20} weight="bold" />
          </Button>
          <Button
            size="icon"
            onClick={() => handleSend()}
            className="bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.85_0.20_85)] text-[oklch(0.15_0.02_280)]"
            disabled={isLoading || !input.trim()}
          >
            <PaperPlaneRight size={20} weight="fill" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
