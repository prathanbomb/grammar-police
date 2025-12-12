export enum Tone {
  ORIGINAL = 'Original (Grammar Fix Only)',
  CHAT = 'Chat (Casual/WhatsApp)',
  EMAIL = 'Email (Professional)',
  SPEAKING = 'Speaking (Natural Flow)',
}

export enum Dialect {
  BRITISH = 'British',
  AMERICAN = 'American',
}

export interface GrammarCorrection {
  original: string;
  correction: string;
  explanation: string;
  type: 'spelling' | 'grammar' | 'tone' | 'punctuation';
  examples: string[];
}

export interface GrammarResponse {
  rewrittenText: string;
  feedback: string;
  corrections: GrammarCorrection[];
}

export interface HistoryItem extends GrammarResponse {
  id: string;
  originalText: string;
  tone: Tone;
  timestamp: number;
}