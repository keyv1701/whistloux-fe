import { WhistBid } from "./whist-bid.enum";

export interface WhistBidDetail {
  bidType: WhistBid;
  count: number;
  success: boolean;
}
