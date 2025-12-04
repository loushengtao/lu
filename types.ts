export interface Player {
  id: string;
  nickname: string;
  gameId: string; // BattleTag or In-game ID
  registeredAt: number;
}

export interface PlayerScore {
  playerId: string;
  roundResults: { [roundIndex: number]: number }; // Maps round index to Rank (1-8)
}

export interface Group {
  id: string;
  name: string;
  playerIds: string[];
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  status: 'registration' | 'active' | 'completed';
  totalRounds: number; // BO1, BO2, etc.
  scoringSystem: number[]; // e.g. [9, 7, 6, 5, 4, 3, 2, 1] for ranks 1-8
  players: Player[];
  groups: { [roundIndex: number]: Group[] }; // Groups can change per round, but for this simpler version, we might keep them or reshuffle.
  // For this implementation: We will assume groups are static for the set of rounds, or we reshuffle manually. 
  // To keep it simple based on the request: "Grouping into 8", we will generate groups once when starting.
  generatedGroups: Group[]; 
  scores: PlayerScore[];
  createdAt: number;
}

export const DEFAULT_SCORING = [9, 7, 6, 5, 4, 3, 2, 1];
