export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  uid: string;
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  cards: Card[];
  team: 1 | 2;
  isBot: boolean;
  stats?: {
    wins: number;
    losses: number;
  };
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
}

export interface GameRequest {
  id: string;
  sender: Friend;
  message: string;
  timestamp: number;
}

export interface GameHistoryItem {
  id: string;
  date: string;
  opponentName: string;
  opponentAvatar: string;
  result: 'win' | 'loss';
  score: string;
  coins: number;
}

export interface UserProfile {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  avatar: string;
  coins: number;
  wins: number;
  losses: number;
  level: number;
  isRegistered: boolean;
  friends: Friend[];
  blocked: string[];
  gameRequests: GameRequest[];
  history: GameHistoryItem[]; // Added history
}

export type GamePhase = 
  | 'initializing'
  | 'dealing_1'
  | 'bidding'
  | 'dealing_2'
  | 'playing'
  | 'trick_resolution'
  | 'round_end'
  | 'game_end';

export interface PlayedCard {
  playerId: string;
  card: Card;
  order: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  isEmoji?: boolean;
}
