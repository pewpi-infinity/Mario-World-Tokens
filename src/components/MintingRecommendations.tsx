import { useEffect, useState } from 'react'
import { MarioToken, Denomination } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Lightbulb, TrendUp, Scales, Users } from '@phosphor-icons/react'

interface MintingRecommendation {
  denomination: Denomination
  priority: 'high' | 'medium' | 'low'
  reasoning: string
  suggestedQuantity: number
}

interface MintingRecommendationsProps {
  allTokens: MarioToken[]
  onRecommendationSelect?: (denomination: Denomination) => void
}

export function MintingRecommendations({ allTokens, onRecommendationSelect }: MintingRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<MintingRecommendation[]>([])
  const [insights, setInsights] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true)

      const denominationCounts = {
        1: allTokens.filter(t => t.denomination === 1).length,
        5: allTokens.filter(t => t.denomination === 5).length,
        10: allTokens.filter(t => t.denomination === 10).length,
        20: allTokens.filter(t => t.denomination === 20).length,
        50: allTokens.filter(t => t.denomination === 50).length,
        100: allTokens.filter(t => t.denomination === 100).length,
      }

      const totalValue = allTokens.reduce((sum, t) => sum + t.denomination, 0)
      const totalTokens = allTokens.length
      const uniqueOwners = new Set(allTokens.map(t => t.currentOwner)).size

      const analysisPrompt = (window.spark.llmPrompt as any)`You are a financial economist analyzing a token economy for a digital currency system called Mario Tokens (Federal Reserve Notes).

Current token distribution:
- $1 notes: ${denominationCounts[1]} tokens
- $5 notes: ${denominationCounts[5]} tokens
- $10 notes: ${denominationCounts[10]} tokens
- $20 notes: ${denominationCounts[20]} tokens
- $50 notes: ${denominationCounts[50]} tokens
- $100 notes: ${denominationCounts[100]} tokens

Total value in circulation: $${totalValue}
Total tokens minted: ${totalTokens}
Unique token holders: ${uniqueOwners}

Based on this data, provide strategic minting recommendations. Return a JSON object with this exact structure:
{
  "recommendations": [
    {
      "denomination": 1,
      "priority": "high",
      "reasoning": "Brief explanation (max 25 words)",
      "suggestedQuantity": 5
    }
  ],
  "marketInsights": "2-3 sentence overview of the token economy health and key strategic considerations"
}

Guidelines:
- Lower denominations ($1, $5, $10) should be more common for everyday transactions
- Higher denominations ($50, $100) should be rarer but present for large transfers
- $20 bills are the workhorse denomination in real currency
- Consider scarcity and abundance in your recommendations
- Priority levels: "high" (urgent need), "medium" (beneficial), "low" (optional)
- Suggest realistic quantities (1-10 tokens per recommendation)
- Provide exactly 3 recommendations, ordered by priority
- If the economy is very small (under 10 tokens), recommend basics first
- If imbalanced, prioritize what's missing`

      try {
        const response = await window.spark.llm(analysisPrompt, 'gpt-4o-mini', true)
        const data = JSON.parse(response)

        setRecommendations(data.recommendations)
        setInsights(data.marketInsights)
      } catch (error) {
        console.error('Failed to generate recommendations:', error)
        setRecommendations([
          {
            denomination: 20,
            priority: 'high',
            reasoning: 'Workhorse denomination for everyday transactions',
            suggestedQuantity: 3
          },
          {
            denomination: 1,
            priority: 'medium',
            reasoning: 'Essential for small transactions and making change',
            suggestedQuantity: 5
          },
          {
            denomination: 100,
            priority: 'low',
            reasoning: 'High-value transfers and wealth storage',
            suggestedQuantity: 1
          }
        ])
        setInsights('Token economy is in early stages. Focus on building a balanced mix of denominations.')
      } finally {
        setIsLoading(false)
      }
    }

    generateRecommendations()
  }, [allTokens])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-accent text-accent-foreground'
      case 'medium':
        return 'bg-primary text-primary-foreground'
      case 'low':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <TrendUp size={16} weight="fill" />
      case 'medium':
        return <Scales size={16} weight="fill" />
      case 'low':
        return <Users size={16} weight="fill" />
      default:
        return <Lightbulb size={16} weight="fill" />
    }
  }

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb size={24} weight="fill" className="text-accent" />
            AI Minting Strategy
          </CardTitle>
          <CardDescription>Analyzing token economy...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb size={24} weight="fill" className="text-accent" />
          AI Minting Strategy
        </CardTitle>
        <CardDescription className="mt-2 text-sm leading-relaxed">
          {insights}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => (
          <button
            key={index}
            onClick={() => onRecommendationSelect?.(rec.denomination)}
            className="w-full text-left p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-accent/5 transition-all duration-200 hover:scale-[1.01] group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getPriorityColor(rec.priority)} flex items-center gap-1`}>
                    {getPriorityIcon(rec.priority)}
                    <span className="capitalize">{rec.priority}</span>
                  </Badge>
                  <span className="font-serif font-bold text-lg">${rec.denomination}</span>
                  <span className="text-xs text-muted-foreground">
                    × {rec.suggestedQuantity}
                  </span>
                </div>
                <p className="text-sm text-foreground">
                  {rec.reasoning}
                </p>
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
