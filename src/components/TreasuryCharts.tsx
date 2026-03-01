import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { TreasuryStats } from '@/lib/types'
import * as d3 from 'd3'
import { motion } from 'framer-motion'

export interface TreasuryChartsProps {
  stats: TreasuryStats
  marioLogo: string
}

export function TreasuryCharts({ stats, marioLogo }: TreasuryChartsProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [marioPosition, setMarioPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || stats.mintingHistory.length === 0) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = 400
    const margin = { top: 40, right: 40, bottom: 60, left: 70 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleTime()
      .domain(d3.extent(stats.mintingHistory, d => new Date(d.timestamp)) as [Date, Date])
      .range([0, chartWidth])

    const y = d3.scaleLinear()
      .domain([0, d3.max(stats.mintingHistory, d => d.totalValue) || 100])
      .nice()
      .range([chartHeight, 0])

    const line = d3.line<typeof stats.mintingHistory[0]>()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.totalValue))
      .curve(d3.curveMonotoneX)

    g.append('defs').append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', y(0))
      .attr('x2', 0).attr('y2', y((d3.max(stats.mintingHistory, d => d.totalValue) || 100)))
      .selectAll('stop')
      .data([
        { offset: '0%', color: 'oklch(0.75 0.18 85)', opacity: 0.3 },
        { offset: '100%', color: 'oklch(0.75 0.18 85)', opacity: 0 }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color)
      .attr('stop-opacity', d => d.opacity)

    const area = d3.area<typeof stats.mintingHistory[0]>()
      .x(d => x(new Date(d.timestamp)))
      .y0(chartHeight)
      .y1(d => y(d.totalValue))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(stats.mintingHistory)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area)

    g.append('path')
      .datum(stats.mintingHistory)
      .attr('fill', 'none')
      .attr('stroke', 'oklch(0.75 0.18 85)')
      .attr('stroke-width', 3)
      .attr('d', line)

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .style('color', 'oklch(0.65 0.02 280)')
      .selectAll('text')
      .style('font-size', '12px')

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}`))
      .style('color', 'oklch(0.65 0.02 280)')
      .selectAll('text')
      .style('font-size', '12px')

    g.selectAll('.dot')
      .data(stats.mintingHistory)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(new Date(d.timestamp)))
      .attr('cy', d => y(d.totalValue))
      .attr('r', 4)
      .attr('fill', 'oklch(0.75 0.18 85)')
      .attr('stroke', 'oklch(0.15 0.02 280)')
      .attr('stroke-width', 2)

    const lastPoint = stats.mintingHistory[stats.mintingHistory.length - 1]
    if (lastPoint) {
      const marioX = x(new Date(lastPoint.timestamp)) + margin.left
      const marioY = y(lastPoint.totalValue) + margin.top - 30
      setMarioPosition({ x: marioX, y: marioY })
    }

  }, [stats])

  if (stats.mintingHistory.length === 0) {
    return (
      <Card className="p-12 text-center bg-card border-2 border-border">
        <p className="text-muted-foreground">Mint your first coin to see treasury growth charts!</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-card border-2 border-border">
      <h3 className="text-2xl font-bold mb-6">Treasury Growth Over Time</h3>
      <div ref={containerRef} className="relative">
        <svg ref={svgRef}></svg>
        {marioPosition.x > 0 && (
          <motion.div
            className="absolute pointer-events-none"
            initial={{ x: 0, y: marioPosition.y }}
            animate={{ x: marioPosition.x - 20, y: marioPosition.y }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <motion.img
              src={marioLogo}
              alt="Mario"
              className="w-10 h-10 object-contain"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {Object.entries(stats.contentBreakdown).map(([type, count]) => (
          <div key={type} className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground capitalize">{type}</p>
            <p className="text-2xl font-bold text-foreground">{count}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
