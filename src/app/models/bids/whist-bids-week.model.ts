import { WhistBidDetail } from './whist-bid-detail.model';

export interface WhistBidsWeek {
  uuid: string;
  date: Date;
  bidDetails: WhistBidDetail[];
}
