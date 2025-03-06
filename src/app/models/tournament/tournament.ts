// src/app/models/tournament/tournament.interface.ts
import { TournamentContactInterface } from './tournament-contact.interface';
import { TournamentRegistrationInterface } from './tournament-registration.interface';
import { RegistrationInfoInterface } from './registration-info.interface';

export interface Tournament {
  uuid: string;
  name: string;
  organization: string;
  date: Date;
  isDateConfirmed: boolean;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  postalCode: string;
  maxPlayers: number;
  entryFee: number;
  description: string;
  prizes: string;
  registrationDeadline: Date;
  includedItems: string;
  contacts: TournamentContactInterface[];
  parkingInfo: string;
  rounds: number;
  handsPerRound: number;
  registrationInfo: RegistrationInfoInterface;
  registrations: TournamentRegistrationInterface[];
  registrationsCount: number;
}
