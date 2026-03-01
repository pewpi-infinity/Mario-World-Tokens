export type Denomination = 1 | 5 | 10 | 20 | 50 | 100

export interface NoteProvenance {
  artisticValue: number
  historicalSignificance: number
  famousMinter: boolean
  uniqueDesign: boolean
  culturalImpact: number
}

export interface MarioToken {
  id: string
  serialNumber: string
  denomination: Denomination
  mintedBy: string
  mintedAt: number
  location: string
  designNotes: string
  currentOwner: string
  provenance?: NoteProvenance
}

export interface Transaction {
  id: string
  tokenId: string
  from: string
  to: string
  timestamp: number
  serialNumber: string
  denomination: Denomination
}

export interface UserWallet {
  username: string
  tokens: MarioToken[]
}

export interface MinterPool {
  username: string
  availableTokens: MarioToken[]
}

export interface AppState {
  allTokens: MarioToken[]
  allTransactions: Transaction[]
  minters: string[]
}
