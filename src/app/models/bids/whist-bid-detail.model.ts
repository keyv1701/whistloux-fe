import { WhistBid } from "./whist-bid.enum";

export interface WhistBidDetail {
  bidDate: string;  // Format ISO pour représenter LocalDate
  bidType: WhistBid;
  count: number;
  success: boolean;
}
