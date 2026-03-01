import { useState, useMemo } from 'react'
import { MarioToken } from '@/lib/types'
import { assessAllTokens, getAssessmentSummary, TokenAssessment } from '@/lib/assessment'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Sparkle, TrendUp, Star, Crown, Diamond } from '@phosphor-icons/react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface AutoAssessmentProps {
  tokens: MarioToken[]
}

const RARITY_COLORS = {
  'common': 'oklch(0.70 0.05 155)',
  'uncommon': 'oklch(0.65 0.12 155)',
  'rare': 'oklch(0.60 0.15 240)',
  'very-rare': 'oklch(0.65 0.18 285)',
  'ultra-rare': 'oklch(0.70 0.20 25)'
}

const RARITY_ICONS = {
  'common': Star,
  'uncommon': Star,
  'rare': Sparkle,
  'very-rare': Diamond,
  'ultra-rare': Crown
}

const RARITY_LABELS = {
  'common': 'Common',
  'uncommon': 'Uncommon',
  'rare': 'Rare',
  'very-rare': 'Very Rare',
  'ultra-rare': 'Ultra Rare'
}

export function AutoAssessment({ tokens }: AutoAssessmentProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const assessments = useMemo(() => {
    if (tokens.length === 0) return []
    return assessAllTokens(tokens)
  }, [tokens])

  const summary = useMemo(() => {
    if (assessments.length === 0) return null
    return getAssessmentSummary(assessments)
  }, [assessments])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsAnalyzing(false)
    setShowDetails(true)
  }

  if (tokens.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Sparkle size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No tokens to assess</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tokens must be minted before analysis
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const rarityData = summary ? Object.entries(summary.rarityDistribution).map(([rarity, count]) => ({
    rarity: RARITY_LABELS[rarity as keyof typeof RARITY_LABELS],
    count,
    fill: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS]
  })) : []

  const factorBreakdown = assessments.length > 0 ? [
    {
      name: 'Serial Patterns',
      value: Math.round(assessments.reduce((sum, a) => sum + a.rarityFactors.serialPattern, 0) / assessments.length)
    },
    {
      name: 'Provenance',
      value: Math.round(assessments.reduce((sum, a) => sum + a.rarityFactors.provenanceScore, 0) / assessments.length)
    },
    {
      name: 'Minting History',
      value: Math.round(assessments.reduce((sum, a) => sum + a.rarityFactors.mintingHistory, 0) / assessments.length)
    },
    {
      name: 'Ownership',
      value: Math.round(assessments.reduce((sum, a) => sum + a.rarityFactors.ownershipHistory, 0) / assessments.length)
    }
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif">Treasury Auto-Assessment</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered analysis of collectible value across all tokens
          </p>
        </div>
        {!showDetails && (
          <Button onClick={handleAnalyze} disabled={isAnalyzing} size="lg">
            {isAnalyzing ? (
              <>
                <Sparkle className="mr-2 animate-spin" size={20} />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkle className="mr-2" size={20} weight="fill" />
                Run Assessment
              </>
            )}
          </Button>
        )}
      </div>

      {showDetails && summary && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="top-tokens">Top Tokens</TabsTrigger>
            <TabsTrigger value="all-tokens">All Tokens</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Base Value</p>
                      <p className="text-2xl font-bold font-serif">
                        ${summary.totalBaseValue.toLocaleString()}
                      </p>
                    </div>
                    <TrendUp size={32} className="text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Collectible Value</p>
                      <p className="text-2xl font-bold font-serif text-accent">
                        ${summary.totalCollectibleValue.toLocaleString()}
                      </p>
                    </div>
                    <Sparkle size={32} className="text-accent" weight="fill" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Premium</p>
                      <p className="text-2xl font-bold font-serif text-primary">
                        ${summary.totalPremium.toFixed(2)}
                      </p>
                    </div>
                    <Crown size={32} className="text-primary" weight="fill" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Premium</p>
                      <p className="text-2xl font-bold font-serif">
                        ${summary.averagePremium.toFixed(2)}
                      </p>
                    </div>
                    <Diamond size={32} className="text-secondary" weight="fill" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rarity Distribution</CardTitle>
                  <CardDescription>Breakdown of token rarity across treasury</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={rarityData}
                          dataKey="count"
                          nameKey="rarity"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={(entry) => `${entry.rarity}: ${entry.count}`}
                        >
                          {rarityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Value Factor Breakdown</CardTitle>
                  <CardDescription>Average contribution to collectible value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={factorBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="oklch(0.45 0.14 155)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="top-tokens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Most Valuable Tokens</CardTitle>
                <CardDescription>Highest collectible value in the treasury</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {summary.topAssessments.map((assessment, index) => (
                      <AssessmentCard key={assessment.tokenId} assessment={assessment} rank={index + 1} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-tokens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Complete Assessment Report</CardTitle>
                <CardDescription>All {assessments.length} tokens analyzed</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {assessments
                      .sort((a, b) => b.collectibleValue - a.collectibleValue)
                      .map((assessment, index) => (
                        <AssessmentCard key={assessment.tokenId} assessment={assessment} rank={index + 1} />
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function AssessmentCard({ assessment, rank }: { assessment: TokenAssessment; rank: number }) {
  const RarityIcon = RARITY_ICONS[assessment.rarity]
  
  return (
    <Card className="relative overflow-hidden">
      <div 
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: RARITY_COLORS[assessment.rarity] }}
      />
      <CardContent className="pt-4 pl-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
              #{rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{assessment.serialNumber}</span>
                <Badge variant="outline" className="text-xs">
                  ${assessment.denomination}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: RARITY_COLORS[assessment.rarity] + '20' }}
                >
                  <RarityIcon size={14} weight="fill" className="mr-1" />
                  {RARITY_LABELS[assessment.rarity]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  +{assessment.premiumPercentage}% premium
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Collectible Value</div>
            <div className="text-xl font-bold font-serif text-accent">
              ${assessment.collectibleValue.toFixed(2)}
            </div>
          </div>
        </div>

        {assessment.highlights.length > 0 && (
          <div className="space-y-2 mt-3 pt-3 border-t">
            <div className="text-xs font-semibold text-muted-foreground">Value Highlights</div>
            <div className="flex flex-wrap gap-1">
              {assessment.highlights.map((highlight, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Serial Pattern</div>
            <Progress value={assessment.rarityFactors.serialPattern} className="h-2" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Provenance</div>
            <Progress value={assessment.rarityFactors.provenanceScore} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
