import { MarioToken, Transaction } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendUp, Coins, Users } from '@phosphor-icons/react'
import { groupTokensByDenomination } from '@/lib/currency'

interface TreasuryChartsProps {
  tokens: MarioToken[]
  transactions: Transaction[]
}

const DENOMINATION_COLORS = {
  1: 'oklch(0.65 0.15 155)',
  5: 'oklch(0.60 0.18 240)',
  10: 'oklch(0.70 0.15 85)',
  20: 'oklch(0.60 0.12 180)',
  50: 'oklch(0.55 0.14 285)',
  100: 'oklch(0.60 0.16 25)'
}

export function TreasuryCharts({ tokens, transactions }: TreasuryChartsProps) {
  const denominationGroups = groupTokensByDenomination(tokens)
  
  const denominationData = Object.entries(denominationGroups).map(([denom, count]) => ({
    denomination: `$${denom}`,
    count,
    value: parseInt(denom) * count,
    fill: DENOMINATION_COLORS[parseInt(denom) as keyof typeof DENOMINATION_COLORS]
  }))

  const minterStats = tokens.reduce((acc, token) => {
    if (!acc[token.mintedBy]) {
      acc[token.mintedBy] = { count: 0, value: 0 }
    }
    acc[token.mintedBy].count++
    acc[token.mintedBy].value += token.denomination
    return acc
  }, {} as Record<string, { count: number; value: number }>)

  const minterData = Object.entries(minterStats)
    .map(([minter, stats]) => ({
      minter: minter.length > 15 ? minter.substring(0, 12) + '...' : minter,
      fullMinter: minter,
      count: stats.count,
      value: stats.value
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const totalCirculation = tokens.reduce((sum, t) => sum + t.denomination, 0)
  const uniqueMinters = new Set(tokens.map(t => t.mintedBy)).size

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Circulation</p>
                <p className="text-2xl font-bold font-serif">${totalCirculation.toLocaleString()}</p>
              </div>
              <Coins size={32} className="text-primary" weight="fill" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notes in Circulation</p>
                <p className="text-2xl font-bold font-serif">{tokens.length.toLocaleString()}</p>
              </div>
              <TrendUp size={32} className="text-accent" weight="fill" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Minters</p>
                <p className="text-2xl font-bold font-serif">{uniqueMinters}</p>
              </div>
              <Users size={32} className="text-secondary" weight="fill" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notes by Denomination</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={denominationData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="denomination" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Value Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={denominationData}
                    dataKey="value"
                    nameKey="denomination"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.denomination}: $${entry.value}`}
                  >
                    {denominationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Minters by Output Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={minterData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis dataKey="minter" type="category" width={100} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    labelFormatter={(value, payload) => {
                      const item = payload?.[0]?.payload
                      return item ? item.fullMinter : value
                    }}
                  />
                  <Bar dataKey="value" fill="oklch(0.45 0.14 155)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
