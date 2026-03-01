export type ContentType = 
  | 'music'
  | 'video'
  | 'image'
  | 'poetry'
  | 'clout'
  | 'text';

export interface ContentAttachment {
  type: ContentType;
  title: string;
  description: string;
  url?: string;
  data?: string;
}

export interface MarioCoin {
  id: string;
  value: number;
  mintedAt: number;
  mintedBy: string;
  content: ContentAttachment;
  transferHistory: Transfer[];
}

export interface Transfer {
  from: string;
  to: string;
  timestamp: number;
  note?: string;
}

export interface TreasuryStats {
  totalValue: number;
  coinCount: number;
  contentBreakdown: Record<ContentType, number>;
  mintingHistory: MintingEvent[];
}

export interface MintingEvent {
  timestamp: number;
  value: number;
  totalValue: number;
}
