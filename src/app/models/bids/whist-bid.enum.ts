export enum WhistBid {
  PM = 'PM',
  PIC = 'PIC',
  H8 = 'H8',
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
  [WhistBid.PM]: 'Petit Misère',
  [WhistBid.PIC]: 'Picolissimo',
  [WhistBid.H8]: 'Jeu à 8 levées (huitième)',
  [WhistBid.PME]: 'Petit Misère Entame',
  [WhistBid.AB9]: 'Abondance à 9 levées',
  [WhistBid.GM]: 'Grand Misère',
  [WhistBid.AB10]: 'Abondance à 10 levées',
  [WhistBid.AB11]: 'Abondance à 11 levées',
  [WhistBid.GME]: 'Grand Misère Entame',
  [WhistBid.GMO]: 'Grand Misère Ouvert',
  [WhistBid.PCH]: 'Petite Chelem',
  [WhistBid.GCH]: 'Grand Chelem'
};

export const WhistBidPoints: Record<WhistBid, number> = {
  [WhistBid.PM]: -4,
  [WhistBid.PIC]: 5,
  [WhistBid.H8]: 6,
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
