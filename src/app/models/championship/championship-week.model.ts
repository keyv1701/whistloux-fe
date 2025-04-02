// src/app/shared/models/championship/championship-week.model.ts
import { PlayerWeekScore } from './player-week-score.model';

export interface ChampionshipWeek {
  uuid: string;
  date: Date;
  weekNumber: number;
  season: string;
  description: string;
  encodingComplete: boolean;
  playerScores?: PlayerWeekScore[];
}
