import { Tournament, Player, Group, PlayerScore, DEFAULT_SCORING } from '../types';

const STORAGE_KEY = 'tournament_manager_data_v1';

interface AppData {
  tournaments: Tournament[];
}

const getAppData = (): AppData => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { tournaments: [] };
};

const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const createTournament = (name: string, description: string, rounds: number, scoringSystem: number[] = DEFAULT_SCORING): Tournament => {
  const appData = getAppData();
  const newTournament: Tournament = {
    id: crypto.randomUUID(),
    name,
    description,
    status: 'registration',
    totalRounds: rounds,
    scoringSystem,
    players: [],
    groups: {},
    generatedGroups: [],
    scores: [],
    createdAt: Date.now(),
  };
  appData.tournaments.push(newTournament);
  saveAppData(appData);
  return newTournament;
};

export const getTournament = (id: string): Tournament | undefined => {
  const appData = getAppData();
  return appData.tournaments.find(t => t.id === id);
};

export const registerPlayer = (tournamentId: string, nickname: string, gameId: string): boolean => {
  const appData = getAppData();
  const tournamentIndex = appData.tournaments.findIndex(t => t.id === tournamentId);
  
  if (tournamentIndex === -1) return false;
  
  // Check duplicates
  const exists = appData.tournaments[tournamentIndex].players.some(p => p.gameId === gameId || p.nickname === nickname);
  if (exists) return false; // Prevent duplicate registration

  const newPlayer: Player = {
    id: crypto.randomUUID(),
    nickname,
    gameId,
    registeredAt: Date.now(),
  };

  appData.tournaments[tournamentIndex].players.push(newPlayer);
  
  // Initialize score object
  const newScore: PlayerScore = {
    playerId: newPlayer.id,
    roundResults: {}
  };
  appData.tournaments[tournamentIndex].scores.push(newScore);

  saveAppData(appData);
  return true;
};

export const startTournament = (tournamentId: string): { success: boolean, message?: string } => {
  const appData = getAppData();
  const tournament = appData.tournaments.find(t => t.id === tournamentId);
  
  if (!tournament) return { success: false, message: 'Tournament not found' };
  
  if (tournament.players.length < 8) {
      return { success: false, message: 'Need at least 8 players to start.' };
  }
  
  if (tournament.players.length % 8 !== 0) {
      return { success: false, message: `Player count (${tournament.players.length}) is not a multiple of 8.` };
  }

  // Shuffle players
  const shuffled = [...tournament.players].sort(() => Math.random() - 0.5);
  const groups: Group[] = [];
  
  for (let i = 0; i < shuffled.length; i += 8) {
      const chunk = shuffled.slice(i, i + 8);
      groups.push({
          id: crypto.randomUUID(),
          name: `Group ${String.fromCharCode(65 + (i / 8))}`, // Group A, Group B...
          playerIds: chunk.map(p => p.id)
      });
  }

  tournament.generatedGroups = groups;
  tournament.status = 'active';
  
  saveAppData(appData);
  return { success: true };
};

export const updateScore = (tournamentId: string, playerId: string, round: number, rank: number) => {
    const appData = getAppData();
    const tournament = appData.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    const playerScore = tournament.scores.find(s => s.playerId === playerId);
    if (playerScore) {
        playerScore.roundResults[round] = rank;
        saveAppData(appData);
    }
};

export const getAllTournaments = (): Tournament[] => {
    return getAppData().tournaments.sort((a, b) => b.createdAt - a.createdAt);
};
