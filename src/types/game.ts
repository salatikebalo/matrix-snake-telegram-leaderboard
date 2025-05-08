
export interface SnakePart {
  x: number;
  y: number;
}

export interface Food {
  x: number;
  y: number;
}

export interface GameState {
  snake: SnakePart[];
  food: Food;
  direction: 'up' | 'down' | 'left' | 'right';
  score: number;
  gameOver: boolean;
  gameStarted: boolean;
  isPaused: boolean;
}

export interface UserData {
  id: string | number;
  username: string;
  first_name: string;
  last_name: string;
  bestScore?: number;
  gamesPlayed?: number;
}

export interface LeaderboardEntry {
  userId: string | number;
  username: string;
  score: number;
  referralBonus?: number;
}
