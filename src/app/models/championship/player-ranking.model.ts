export interface PlayerRanking {
  playerUuid: string;
  playerPseudo: string;
  rank: number;
  totalScore: number;
  roundsPlayed: number;
  bestRoundScores: number[]; // 5 best rounds
  worstRoundScore: number; // Worst round included in total
}
