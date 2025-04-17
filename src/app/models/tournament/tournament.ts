export interface Tournament {
  uuid: string;
  name: string;
  description: string;
  address: string;
  date: Date;
  startTime: string;
  maxPlayers: number;
  registrationOpen: boolean;
  registrationDeadline: Date;
  registrationsCount: number;
  entryFee: number;
  includedItems: string;
  prizes: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
}
