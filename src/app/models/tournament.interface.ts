import { TournamentStatus } from './enums/tournament-status.enum';

export interface Tournament {
  uuid?: string;
  name: string;
  description: string;
  startDate: string; // Format ISO pour les dates
  endDate: string;
  location: string;
  status: TournamentStatus;
  results?: string;
  maxParticipants: number;
  createdAt?: string;
  updatedAt?: string;
}
