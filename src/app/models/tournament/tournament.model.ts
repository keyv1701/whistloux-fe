import { TournamentStatus } from "../enums/tournament-status.enum";

export interface TournamentModel {
  uuid: string;
  name: string;
  description: string;
  address: string;
  lat?: number; // Latitude
  lng?: number; // Longitude
  parking: string;
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
  status: TournamentStatus;
  resultsFile?: string; // URL du fichier de résultats
  hasResults?: boolean;
}
