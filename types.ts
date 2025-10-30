export interface User {
  phoneNumber: string;
  username: string;
  medicalCondition: string;
}

export interface Plant {
  id: string;
  name: string;
  nickname?: string;
  lifeSpan: string;
  seasonalInfo: string;
  usefulInfo: string;
  environment: string;
  wateringFrequency: string;
  imageUrl: string;
  imagePrompt?: string;
  isLoadingImage?: boolean;
  safetyExplanation?: string;
  isSafe?: boolean;
}

export interface Reminder {
  id: string;
  message: string;
  time: Date;
  timeoutId?: number;
  plantId?: string;
  plantName?: string;
}

export interface UnsafePlant {
  name: string;
  commonNames: string[];
  reason: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type AppView = 'dashboard' | 'myGarden' | 'reminders' | 'recommendations' | 'encyclopedia' | 'warnings' | 'aiGuide';