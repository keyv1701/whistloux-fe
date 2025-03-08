import { WhistBidDetail } from './whist-bid-detail.model';

export interface PlayerWhistBids {
  season: string;
  playerUuid: string;
  playerFirstname: string;
  playerLastName: string;
  bidDetails: WhistBidDetail[];
}
