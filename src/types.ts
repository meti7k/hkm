export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type Gender = 'male' | 'female' | 'other' | 'unspecified';
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'canceled';
export type GameType = 'public' | 'private';

export interface User {
  id: number;
  name: string | null;
  username: string | null;
  profile_url: string | null;
  age?: number;
  gender?: Gender;
  last_seen_at?: string;
}

export interface UserProfile extends User {
  coins: number;
  wins: number;
  losses: number;
  level: number;
  isRegistered: boolean;
  friends: Friend[];
  blocked: number[];
  gameRequests: any[];
  history: any[];
  avatar: string;
}

export interface Friend {
  id: number;
  user: User;
  accepted: boolean;
}

export interface Package {
  id: number;
  title: string;
  price: number;
  amount: number;
  start_at: string | null;
  end_at: string | null;
  discount: number;
}

export interface GameInfo {
  id: number;
  bet: number;
  sets: number;
  status: GameStatus;
  leader_id: number;
  winner: number | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  players: Player[];
}

export interface Player {
  id: number;
  game_id: number;
  user_id: number;
  seat: 1 | 2 | 3 | 4;
  joined_at: string;
  left_at: string | null;
  name?: string;
  avatar?: string;
  isBot?: boolean;
  team?: 1 | 2;
  cards?: Card[];
}

export interface Card {
  uid: string;
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
}

export interface PlayedCard {
  playerId: number;
  card: Card;
  order: number;
}

export interface ChatMessage {
  id: string;
  senderId: number;
  text: string;
  timestamp: number;
}

export interface HelloRequest {
  data: string;
}

export interface HelloResponse {
  token: string;
  user_id: number;
  expires_at: string;
  registered: boolean;
  parsed_user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  };
}

export interface UserUpdateRequest {
  name?: string;
  age?: number;
  gender?: Gender;
  username?: string;
}

export interface CreateGameRequest {
  bet: number;
  sets: number;
  type: GameType;
}

export interface FriendListResponse {
  total: number;
  friends: Friend[];
  next_offset: number | null;
}

export interface BlockedUsersListResponse {
  total: number;
  users: User[];
  next_offset: number | null;
}

export interface GameListResponse {
  total: number;
  games: GameInfo[];
}

export interface PackageListResponse {
  total: number;
  packages: Package[];
}

export interface UserSearchResponse {
  count: number;
  users: User[];
}

export interface ActionUserResponse {
  action: 'updated';
  user: User;
}

export interface ActionFriendResponse {
  action: 'accepted' | 'rejected' | 'removed' | 'sent';
  user: User;
  friend_id: number;
}

export interface ActionGameResponse {
  action: 'created' | 'updated' | 'joined' | 'lefted';
  game: GameInfo;
}

export interface BlockActionResponse {
  action: 'blocked' | 'unblocked';
  user: User;
}

export type GamePhase = 
  | 'waiting'
  | 'initializing'
  | 'dealing_1'
  | 'bidding'
  | 'dealing_2'
  | 'playing'
  | 'trick_resolution'
  | 'round_end'
  | 'game_end';

export interface GameState {
  roomId: number;
  phase: GamePhase;
  players: Player[];
  tableCards: PlayedCard[];
  currentTurn: number;
  hakemSeat: number;
  hokm: Suit | null;
  tricks: { team1: number; team2: number };
  matchScore: { team1: number; team2: number };
  ownerId: number;
}
