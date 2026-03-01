import { MarioToken, NoteProvenance } from './types'

export interface TokenAssessment {
  tokenId: string
  serialNumber: string
  denomination: number
  baseValue: number
  collectibleValue: number
  premiumPercentage: number
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'ultra-rare'
  rarityFactors: {
    serialPattern: number
    provenanceScore: number
    mintingHistory: number
    ownershipHistory: number
  }
  highlights: string[]
}

export function assessSerialNumberRarity(serialNumber: string): { score: number; patterns: string[] } {
  const patterns: string[] = []
  let score = 0

  const digits = serialNumber.replace(/[^0-9]/g, '')
  
  if (digits.length === 0) {
    return { score: 0, patterns: [] }
  }

  if (/^(.)\1+$/.test(digits)) {
    patterns.push('All Same Digits (Solid)')
    score += 100
  } else if (/^(.)(.)\1\2\1\2/.test(digits)) {
    patterns.push('Alternating Pattern')
    score += 70
  } else if (/^0+1$/.test(digits) || /^1+$/.test(digits)) {
    patterns.push('Binary Pattern')
    score += 60
  }

  if (/12345678/.test(digits) || /87654321/.test(digits)) {
    patterns.push('Sequential Run')
    score += 80
  } else if (/1234567/.test(digits) || /7654321/.test(digits)) {
    patterns.push('Long Sequential')
    score += 60
  } else if (/123456/.test(digits) || /654321/.test(digits)) {
    patterns.push('Medium Sequential')
    score += 40
  }

  const digitCounts = digits.split('').reduce((acc, d) => {
    acc[d] = (acc[d] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const maxCount = Math.max(...Object.values(digitCounts))
  if (maxCount >= digits.length * 0.75) {
    patterns.push('Mostly Same Digits')
    score += 50
  }

  if (digits === digits.split('').reverse().join('')) {
    patterns.push('Palindrome')
    score += 55
  }

  const leadingZeros = digits.match(/^0+/)
  if (leadingZeros && leadingZeros[0].length >= 4) {
    patterns.push('Leading Zeros')
    score += 35
  }

  if (/00000/.test(digits)) {
    patterns.push('Five Zeros')
    score += 45
  }

  if (/0000$/.test(digits)) {
    patterns.push('Trailing Quad Zeros')
    score += 30
  }

  if (/420|69|777|888|999/.test(digits)) {
    patterns.push('Meme Number')
    score += 25
  }

  if (parseInt(digits) <= 100) {
    patterns.push('Low Serial Number')
    score += 90
  } else if (parseInt(digits) <= 1000) {
    patterns.push('Early Serial')
    score += 50
  }

  return { score: Math.min(score, 100), patterns }
}

export function assessProvenance(provenance?: NoteProvenance): { score: number; highlights: string[] } {
  if (!provenance) {
    return { score: 0, highlights: [] }
  }

  const highlights: string[] = []
  let score = 0

  if (provenance.artisticValue >= 80) {
    highlights.push('Exceptional Artistic Merit')
    score += 40
  } else if (provenance.artisticValue >= 60) {
    highlights.push('High Artistic Value')
    score += 25
  } else if (provenance.artisticValue >= 40) {
    highlights.push('Notable Artistic Quality')
    score += 15
  }

  if (provenance.historicalSignificance >= 80) {
    highlights.push('Major Historical Significance')
    score += 40
  } else if (provenance.historicalSignificance >= 60) {
    highlights.push('Historical Importance')
    score += 25
  } else if (provenance.historicalSignificance >= 40) {
    highlights.push('Historical Interest')
    score += 15
  }

  if (provenance.famousMinter) {
    highlights.push('Famous Minter')
    score += 30
  }

  if (provenance.uniqueDesign) {
    highlights.push('Unique Design')
    score += 20
  }

  if (provenance.culturalImpact >= 80) {
    highlights.push('Significant Cultural Impact')
    score += 35
  } else if (provenance.culturalImpact >= 60) {
    highlights.push('Cultural Relevance')
    score += 20
  } else if (provenance.culturalImpact >= 40) {
    highlights.push('Cultural Interest')
    score += 10
  }

  return { score: Math.min(score, 100), highlights }
}

export function calculateRarity(totalScore: number): 'common' | 'uncommon' | 'rare' | 'very-rare' | 'ultra-rare' {
  if (totalScore >= 80) return 'ultra-rare'
  if (totalScore >= 60) return 'very-rare'
  if (totalScore >= 40) return 'rare'
  if (totalScore >= 20) return 'uncommon'
  return 'common'
}

export function assessToken(token: MarioToken, allTokens: MarioToken[]): TokenAssessment {
  const serialAssessment = assessSerialNumberRarity(token.serialNumber)
  const provenanceAssessment = assessProvenance(token.provenance)
  
  const sameSeriesTokens = allTokens.filter(t => 
    t.mintedBy === token.mintedBy && 
    t.denomination === token.denomination
  )
  const mintingHistoryScore = sameSeriesTokens.length <= 10 ? 30 : 
                               sameSeriesTokens.length <= 50 ? 15 : 5

  const ownershipHistoryScore = token.designNotes.length > 100 ? 20 : 
                                 token.designNotes.length > 50 ? 10 : 0

  const rarityFactors = {
    serialPattern: serialAssessment.score,
    provenanceScore: provenanceAssessment.score,
    mintingHistory: mintingHistoryScore,
    ownershipHistory: ownershipHistoryScore
  }

  const totalScore = (
    serialAssessment.score * 0.35 +
    provenanceAssessment.score * 0.40 +
    mintingHistoryScore * 0.15 +
    ownershipHistoryScore * 0.10
  )

  const premiumPercentage = Math.round(totalScore * 5)
  const collectibleValue = token.denomination * (1 + premiumPercentage / 100)

  const highlights = [
    ...serialAssessment.patterns,
    ...provenanceAssessment.highlights
  ]

  if (mintingHistoryScore >= 20) {
    highlights.push('Limited Production Series')
  }

  if (ownershipHistoryScore >= 15) {
    highlights.push('Rich Historical Documentation')
  }

  return {
    tokenId: token.id,
    serialNumber: token.serialNumber,
    denomination: token.denomination,
    baseValue: token.denomination,
    collectibleValue: parseFloat(collectibleValue.toFixed(2)),
    premiumPercentage,
    rarity: calculateRarity(totalScore),
    rarityFactors,
    highlights
  }
}

export function assessAllTokens(tokens: MarioToken[]): TokenAssessment[] {
  return tokens.map(token => assessToken(token, tokens))
}

export function getAssessmentSummary(assessments: TokenAssessment[]) {
  const totalBaseValue = assessments.reduce((sum, a) => sum + a.baseValue, 0)
  const totalCollectibleValue = assessments.reduce((sum, a) => sum + a.collectibleValue, 0)
  const totalPremium = totalCollectibleValue - totalBaseValue

  const rarityDistribution = assessments.reduce((acc, a) => {
    acc[a.rarity] = (acc[a.rarity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topAssessments = [...assessments]
    .sort((a, b) => b.collectibleValue - a.collectibleValue)
    .slice(0, 10)

  return {
    totalBaseValue,
    totalCollectibleValue,
    totalPremium,
    averagePremium: assessments.length > 0 ? totalPremium / assessments.length : 0,
    rarityDistribution,
    topAssessments
  }
}
