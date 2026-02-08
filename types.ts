
export enum Screen {
  Welcome = 'WELCOME',
  Dashboard = 'DASHBOARD',
  DailyEntry = 'DAILY_ENTRY',
  Settings = 'SETTINGS',
  Guide = 'GUIDE',
  Stats = 'STATS',
  Report = 'REPORT',
  Achievements = 'ACHIEVEMENTS',
  AiChat = 'AI_CHAT',
  BladderDiary = 'BLADDER_DIARY'
}

export type UserStatus = 'dry' | 'wet' | null;

export interface DailyLog {
  date: string;
  status: UserStatus;
}

export interface BladderHourEntry {
  hour: number; // 0-23
  intakeMl: number;
  outputMl: number;
  urgency: boolean;
  leakage: boolean;
}

export interface BladderLog {
  date: string;
  entries: BladderHourEntry[];
}

export interface UserSettings {
  dinnerFluidRestriction: boolean;
  dinnerFluidTime: string;
  bedtimeBathroomReminder: boolean;
  bedtimeBathroomTime: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  type: 'total_dry' | 'streak_dry' | 'total_logs' | 'total_stars';
  unlocked: boolean;
  color: string;
}

// Added StoreItem interface to fix error in StoreScreen.tsx
export interface StoreItem {
  id: string;
  name: string;
  type: 'hat' | 'cape' | 'effect';
  price: number;
  icon: string;
  color: string;
}

// Updated UserProfile to include purchased items and equipped items for the store
export interface UserProfile {
  name: string;
  stars: number;
  earnedBadgeIds: string[];
  purchasedItemIds: string[];
  equippedItems: Record<string, string>;
  settings: UserSettings;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}