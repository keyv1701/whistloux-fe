// src/app/shared/models/championship/player-week-score.model.ts
export interface PlayerWeekScore {
  uuid?: string;
  playerUuid: string;
  playerName: string;
  round1Points: number | null;
  round2Points: number | null;
  round3Points: number | null;
}
