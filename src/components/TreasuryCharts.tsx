import { MarioToken, Transaction } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendUp, Coins, Users } from '@phosphor-icons/react'
import { groupTokensByDenomination } from '@/lib/currency'
import { MarioChartCharacter } from './MarioChartCharacter'
import { motion } from 'framer-motion'

interface TreasuryChartsProps {
  tokens: MarioToken[]
  transactions: Transaction[]
}

const DENOMINATION_COLORS = {
  1: 'oklch(0.75 0.20 85)',
  5: 'oklch(0.55 0.24 30)',
  10: 'oklch(0.45 0.18 145)',
  20: 'oklch(0.60 0.22 260)',
  50: 'oklch(0.70 0.18 330)',
  100: 'oklch(0.65 0.20 60)'
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
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-[oklch(0.75_0.20_85)] to-[oklch(0.65_0.20_85)] border-none text-accent-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Total Circulation</p>
                  <p className="text-3xl font-bold font-serif">${totalCirculation.toLocaleString()}</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Coins size={40} weight="fill" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-[oklch(0.65_0.25_25)] to-[oklch(0.55_0.25_25)] border-none text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Notes in Circulation</p>
                  <p className="text-3xl font-bold font-serif">{tokens.length.toLocaleString()}</p>
                </div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <TrendUp size={40} weight="fill" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-[oklch(0.55_0.20_145)] to-[oklch(0.45_0.20_145)] border-none text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Active Minters</p>
                  <p className="text-3xl font-bold font-serif">{uniqueMinters}</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Users size={40} weight="fill" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Notes by Denomination</span>
            </CardTitle>
            <MarioChartCharacter 
              character="mario" 
              message={`We've got ${tokens.length} notes total! Let's-a-go check the breakdown!`}
            />
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "oklch(0.55 0.24 30)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={denominationData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="oklch(0.7 0.1 245)" />
                  <XAxis 
                    dataKey="denomination" 
                    stroke="oklch(0.8 0.05 245)"
                    style={{ fontSize: '12px', fontFamily: 'Inter' }}
                  />
                  <YAxis 
                    stroke="oklch(0.8 0.05 245)"
                    style={{ fontSize: '12px', fontFamily: 'Inter' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Value Distribution</span>
            </CardTitle>
            <MarioChartCharacter 
              character="luigi" 
              message={`Mamma mia! The total value is $${totalCirculation.toLocaleString()}!`}
              position="right"
            />
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Value",
                  color: "oklch(0.55 0.24 30)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={denominationData}
                    dataKey="value"
                    nameKey="denomination"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${entry.denomination}: $${entry.value.toLocaleString()}`}
                    labelLine={{ stroke: 'oklch(0.7 0.1 245)', strokeWidth: 1 }}
                  >
                    {denominationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-2 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Minters by Output Value</span>
            </CardTitle>
            <div className="flex items-center justify-between mt-4">
              <MarioChartCharacter 
                character="mario" 
                message={`These ${uniqueMinters} minters are working hard!`}
              />
              <MarioChartCharacter 
                character="luigi" 
                message="Yahoo! Great job everyone!"
                position="right"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Value",
                  color: "oklch(0.55 0.24 30)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={minterData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="oklch(0.7 0.1 245)" />
                  <XAxis 
                    type="number"
                    stroke="oklch(0.8 0.05 245)"
                    style={{ fontSize: '12px', fontFamily: 'Inter' }}
                  />
                  <YAxis 
                    dataKey="minter" 
                    type="category" 
                    width={100}
                    stroke="oklch(0.8 0.05 245)"
                    style={{ fontSize: '12px', fontFamily: 'Inter' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    labelFormatter={(value, payload) => {
                      const item = payload?.[0]?.payload
                      return item ? item.fullMinter : value
                    }}
                  />
                  <Bar dataKey="value" fill="oklch(0.55 0.24 30)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
