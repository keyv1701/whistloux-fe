import { WhistBidDetail } from "../bids/whist-bid-detail.model";

export interface PlayerWeekScoreRoundItem {
  playerUuid: string;
  roundPoints: number | null;
  bidDetails: WhistBidDetail[];
}
