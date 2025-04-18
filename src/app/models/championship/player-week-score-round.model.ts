import { PlayerWeekScoreRoundItem } from "./player-week-score-round-item.model";

export interface PlayerWeekScoreRound {
  round: number;
  playerWeekScoreRoundItems: PlayerWeekScoreRoundItem[];
}
