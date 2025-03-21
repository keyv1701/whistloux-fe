import { WhistBidDetail } from './whist-bid-detail.model';

export interface PlayerWhistBids {
  season: string;
  playerUuid: string;
  playerPseudo: string;
  bidDetails: WhistBidDetail[];
}
