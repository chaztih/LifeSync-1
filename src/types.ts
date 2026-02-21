export enum GoalType {
  BIG = 'BIG',
  SMALL = 'SMALL'
}

export interface Photo {
  id: string;
  url: string;
  timestamp: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  completed: boolean;
  photos: Photo[];
  createdAt: number;
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  photos: Photo[];
  createdAt: number;
}

export type View = 'goals' | 'diary' | 'settings';
