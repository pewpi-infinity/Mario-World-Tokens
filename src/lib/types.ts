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
  stickers?: string[];
}

export interface MarioCoin {
  id: string;
  value: number;
  mintedAt: number;
  mintedBy: string;
  content: ContentAttachment;
  transferHistory: Transfer[];
  serialNumber?: string;
}

export interface Transfer {
  from: string;
  to: string;
  timestamp: number;
  note?: string;
  receiptPrinted?: boolean;
}

export interface TreasuryStats {
  totalValue: number;
  coinCount: number;
  printedUsableTokenCount: number;
  contentBreakdown: Record<ContentType, number>;
  mintingHistory: MintingEvent[];
}

export interface MintingEvent {
  timestamp: number;
  value: number;
  totalValue: number;
}

export type AIBotRole = 
  | 'infinity'
  | 'builder'
  | 'music'
  | 'movement'
  | 'art'
  | 'token'
  | 'design'
  | 'game'
  | 'science';

export type AIPermission = 
  | 'read-all'
  | 'write-all'
  | 'read-files'
  | 'write-files'
  | 'read-tokens'
  | 'write-tokens'
  | 'read-music'
  | 'write-music'
  | 'read-art'
  | 'write-art'
  | 'read-design'
  | 'write-design';

export interface AIBot {
  id: string;
  role: AIBotRole;
  name: string;
  description: string;
  permissions: AIPermission[];
  parentBotId?: string;
  childBotIds: string[];
  isActive: boolean;
  lastActivity: number;
}

export interface AIMessage {
  id: string;
  botId: string;
  userId?: string;
  content: string;
  timestamp: number;
  type: 'user' | 'bot' | 'system';
}

export interface AIConversation {
  id: string;
  botId: string;
  userId: string;
  messages: AIMessage[];
  context?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface AIBotConfig {
  bot: AIBot;
  systemPrompt: string;
  capabilities: string[];
}
