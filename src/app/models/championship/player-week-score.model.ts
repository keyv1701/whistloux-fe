export interface PlayerWeekScore {
  uuid: string;
  playerUuid: string;
  playerPseudo: string;
  round1Points: number | null;
  round2Points: number | null;
  round3Points: number | null;
}
