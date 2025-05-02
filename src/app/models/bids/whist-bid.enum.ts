export enum WhistBid {
  S6 = 'S6',
  S7 = 'S7',
  PM = 'PM',
  PIC = 'PIC',
  S8 = 'S8',
  PME = 'PME',
  AB9 = 'AB9',
  GM = 'GM',
  AB10 = 'AB10',
  AB11 = 'AB11',
  GME = 'GME',
  GMO = 'GMO',
  PCH = 'PCH',
  GCH = 'GCH'
}

export const WhistBidDescriptions: Record<WhistBid, string> = {
  [WhistBid.S6]: 'Solo 6',
  [WhistBid.S7]: 'Solo 7',
  [WhistBid.PM]: 'Petit Misère',
  [WhistBid.PIC]: 'Piccolo',
  [WhistBid.S8]: 'Solo 8',
  [WhistBid.PME]: 'Petit Mis. Etalée',
  [WhistBid.AB9]: 'Abondance 9',
  [WhistBid.GM]: 'Grand Misère',
  [WhistBid.AB10]: 'Abondance 10',
  [WhistBid.AB11]: 'Abondance 11',
  [WhistBid.GME]: 'Grand Mis. Etalée',
  [WhistBid.GMO]: 'Grand Mis. Et. Ouv.',
  [WhistBid.PCH]: 'Petit Chelem',
  [WhistBid.GCH]: 'Grand Chelem'
};

export const WhistBidPoints: Record<WhistBid, number> = {
  [WhistBid.S6]: 1,
  [WhistBid.S7]: 2,
  [WhistBid.PM]: 4,
  [WhistBid.PIC]: 5,
  [WhistBid.S8]: 6,
  [WhistBid.PME]: 8,
  [WhistBid.AB9]: 10,
  [WhistBid.GM]: 12,
  [WhistBid.AB10]: 14,
  [WhistBid.AB11]: 16,
  [WhistBid.GME]: 20,
  [WhistBid.GMO]: 25,
  [WhistBid.PCH]: 30,
  [WhistBid.GCH]: 40
};

// Fonction utilitaire pour obtenir la description d'un type d'annonce
export function getBidDescription(bidType: WhistBid): string {
  return WhistBidDescriptions[bidType] || bidType.toString();
}

// Fonction utilitaire pour obtenir les points d'un type d'annonce
export function getBidPoints(bidType: WhistBid): number {
  return WhistBidPoints[bidType];
}

// Fonction pour calculer les points en fonction du résultat
export function getPointsForResult(bidType: WhistBid, success: boolean): number {
  const points = WhistBidPoints[bidType];
  return success ? points : -points;
}
