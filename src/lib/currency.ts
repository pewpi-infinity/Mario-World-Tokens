import { Denomination, MarioToken, NoteProvenance } from './types'

export function generateSerialNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const checksum = Math.random().toString(36).substring(2, 4).toUpperCase()
  return `${timestamp}-${random}-${checksum}`
}

export function isRareSerial(serial: string): boolean {
  const digitsOnly = serial.replace(/[^0-9A-Z]/g, '')
  
  const hasRepeating = /(.)\1{3,}/.test(digitsOnly)
  const hasSequential = /(?:0123|1234|2345|3456|4567|5678|6789|ABCD|BCDE|CDEF)/.test(digitsOnly)
  const hasPalindrome = digitsOnly.length >= 5 && digitsOnly === digitsOnly.split('').reverse().join('')
  
  return hasRepeating || hasSequential || hasPalindrome
}

export function getDenominationColor(denomination: Denomination): string {
  const colors: Record<Denomination, string> = {
    1: 'bg-gradient-to-br from-[oklch(0.80_0.18_85)] to-[oklch(0.75_0.20_85)] border-[oklch(0.75_0.20_85)] text-[oklch(0.25_0.08_90)]',
    5: 'bg-gradient-to-br from-[oklch(0.70_0.22_25)] to-[oklch(0.65_0.25_25)] border-[oklch(0.65_0.25_25)] text-white',
    10: 'bg-gradient-to-br from-[oklch(0.60_0.18_145)] to-[oklch(0.55_0.20_145)] border-[oklch(0.55_0.20_145)] text-white',
    20: 'bg-gradient-to-br from-[oklch(0.65_0.20_260)] to-[oklch(0.60_0.22_260)] border-[oklch(0.60_0.22_260)] text-white',
    50: 'bg-gradient-to-br from-[oklch(0.75_0.16_330)] to-[oklch(0.70_0.18_330)] border-[oklch(0.70_0.18_330)] text-[oklch(0.25_0.08_330)]',
    100: 'bg-gradient-to-br from-[oklch(0.70_0.18_60)] to-[oklch(0.65_0.20_60)] border-[oklch(0.65_0.20_60)] text-white',
  }
  return colors[denomination]
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`
}

export function calculateWalletTotal(tokens: MarioToken[]): number {
  return tokens.reduce((sum, token) => sum + token.denomination, 0)
}

export function groupTokensByDenomination(tokens: MarioToken[]): Record<Denomination, number> {
  const groups: Record<Denomination, number> = { 1: 0, 5: 0, 10: 0, 20: 0, 50: 0, 100: 0 }
  tokens.forEach(token => {
    groups[token.denomination]++
  })
  return groups
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function validateGitHubUsername(username: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,38}[a-zA-Z0-9])?$/.test(username)
}

export async function assessNoteProvenance(token: MarioToken): Promise<NoteProvenance> {
  const promptText = `Analyze this Federal Reserve Note for collectible value and significance.

Token Details:
- Serial Number: ${token.serialNumber}
- Denomination: $${token.denomination}
- Minted By: ${token.mintedBy}
- Location: ${token.location}
- Design Notes: ${token.designNotes}
- Minted At: ${new Date(token.mintedAt).toLocaleString()}

Assess the following on a scale of 0-100:
1. Artistic Value: Quality and uniqueness of the design
2. Historical Significance: Historical context and importance
3. Famous Minter: Whether the minter is notable or famous (0 for no, 100 for yes)
4. Unique Design: Creativity and originality of the design approach
5. Cultural Impact: Potential cultural or community significance

Return a JSON object with these exact properties: artisticValue, historicalSignificance, famousMinter (0 or 100), uniqueDesign, culturalImpact`

  try {
    const result = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    const parsed = JSON.parse(result)
    
    return {
      artisticValue: Math.min(100, Math.max(0, parsed.artisticValue || 0)),
      historicalSignificance: Math.min(100, Math.max(0, parsed.historicalSignificance || 0)),
      famousMinter: parsed.famousMinter >= 50,
      uniqueDesign: parsed.uniqueDesign >= 70,
      culturalImpact: Math.min(100, Math.max(0, parsed.culturalImpact || 0))
    }
  } catch (error) {
    return {
      artisticValue: 50,
      historicalSignificance: 30,
      famousMinter: false,
      uniqueDesign: false,
      culturalImpact: 40
    }
  }
}

export function calculateNoteValue(token: MarioToken): { baseValue: number; collectibleValue: number; totalValue: number } {
  const baseValue = token.denomination
  
  if (!token.provenance) {
    return { baseValue, collectibleValue: 0, totalValue: baseValue }
  }

  const p = token.provenance
  let collectibleMultiplier = 0

  if (isRareSerial(token.serialNumber)) {
    collectibleMultiplier += 0.5
  }

  if (p.famousMinter) {
    collectibleMultiplier += 1.0
  }

  if (p.uniqueDesign) {
    collectibleMultiplier += 0.3
  }

  collectibleMultiplier += (p.artisticValue / 100) * 0.5
  collectibleMultiplier += (p.historicalSignificance / 100) * 0.4
  collectibleMultiplier += (p.culturalImpact / 100) * 0.3

  const collectibleValue = baseValue * collectibleMultiplier
  const totalValue = baseValue + collectibleValue

  return {
    baseValue,
    collectibleValue: Math.round(collectibleValue * 100) / 100,
    totalValue: Math.round(totalValue * 100) / 100
  }
}
