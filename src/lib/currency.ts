import { Denomination, MarioToken } from './types'

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
    1: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    5: 'bg-blue-50 border-blue-300 text-blue-900',
    10: 'bg-amber-50 border-amber-300 text-amber-900',
    20: 'bg-teal-50 border-teal-300 text-teal-900',
    50: 'bg-purple-50 border-purple-300 text-purple-900',
    100: 'bg-rose-50 border-rose-300 text-rose-900',
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
