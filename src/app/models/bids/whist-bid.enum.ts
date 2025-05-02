export enum WhistBid {
  S6 = 'S6',
  S7 = 'S7',
  PM = 'PM',
  PIC = 'PIC',
  S8 = 'S8',
  PME = 'PME',
  A9 = 'A9',
  GM = 'GM',
  A10 = 'A10',
  A11 = 'A11',
  GME = 'GME',
  GMEO = 'GMEO',
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
  [WhistBid.A9]: 'Abondance 9',
  [WhistBid.GM]: 'Grand Misère',
  [WhistBid.A10]: 'Abondance 10',
  [WhistBid.A11]: 'Abondance 11',
  [WhistBid.GME]: 'Grand Mis. Etalée',
  [WhistBid.GMEO]: 'Grand Mis. Et. Ouv.',
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
  [WhistBid.A9]: 10,
  [WhistBid.GM]: 12,
  [WhistBid.A10]: 14,
  [WhistBid.A11]: 16,
  [WhistBid.GME]: 20,
  [WhistBid.GMEO]: 25,
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
