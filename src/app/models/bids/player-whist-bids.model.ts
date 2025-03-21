import { WhistBidsWeek } from "./whist-bids-week.model";

export interface PlayerWhistBids {
  season: string;
  playerUuid: string;
  playerPseudo: string;
  weeks: WhistBidsWeek[];
}
