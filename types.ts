
export enum ReadingMode {
  BAZI = 'bazi',
  ASTRO = 'astro',
  TAROT = 'tarot'
}

export interface UserInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface TarotCard {
  id: number;
  name: string;
  type: 'major' | 'minor';
  suit?: string;
  rank?: string;
  element?: string;
  keywords: string[];
  desc_up: string;
  desc_rev: string;
  advice_career: string;
  advice_love: string;
  advice_health: string;
}

export interface SelectedTarot {
  card: TarotCard;
  isReversed: boolean;
}

export interface ReadingResult {
  type: ReadingMode;
  title: string;
  summary: string;
  details: any;
  aiInterpretation?: string;
}
