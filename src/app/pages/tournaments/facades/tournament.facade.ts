import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TournamentService } from '../services/tournament.service';
import { Tournament } from "../../../models/tournament/tournament";
import {
  TournamentRegistrationRequestInterface
} from "../../../models/tournament/tournament-registration-request.interface";
import { TournamentRegistrationInterface } from "../../../models/tournament/tournament-registration.interface";

@Injectable({
  providedIn: 'root'
})
export class TournamentFacade {
  private tournamentsSubject = new BehaviorSubject<Tournament[]>([]);
  private currentTournamentSubject = new BehaviorSubject<Tournament | null>(null);

  public tournaments$ = this.tournamentsSubject.asObservable();
  public currentTournament$ = this.currentTournamentSubject.asObservable();

  constructor(private tournamentService: TournamentService) {
  }

  loadTournaments(): void {
    this.tournamentService.getAllTournaments().pipe(
      tap(tournaments => this.tournamentsSubject.next(tournaments))
    ).subscribe();
  }

  loadTournament(uuid: string): void {
    this.tournamentService.getTournamentByUuid(uuid).pipe(
      tap(tournament => this.currentTournamentSubject.next(tournament))
    ).subscribe();
  }

  createTournament(tournament: Tournament): Observable<Tournament> {
    return this.tournamentService.createTournament(tournament).pipe(
      tap(() => this.loadTournaments())
    );
  }

  updateTournament(tournament: Tournament): Observable<Tournament> {
    return this.tournamentService.updateTournament(tournament).pipe(
      tap(updatedTournament => {
        this.currentTournamentSubject.next(updatedTournament);
        this.loadTournaments();
      })
    );
  }

  deleteTournament(uuid: string): Observable<void> {
    return this.tournamentService.deleteTournament(uuid).pipe(
      tap(() => {
        if (this.currentTournamentSubject.value?.uuid === uuid) {
          this.currentTournamentSubject.next(null);
        }
        this.loadTournaments();
      })
    );
  }

  registerForTournament(tournamentId: string, registration: TournamentRegistrationRequestInterface): Observable<TournamentRegistrationInterface> {
    return this.tournamentService.registerForTournament(tournamentId, registration).pipe(
      tap(() => {
        // Rechargement des données du tournoi après inscription
        if (this.currentTournamentSubject.value?.uuid === tournamentId) {
          this.loadTournament(tournamentId);
        }
      })
    );
  }

  cancelRegistration(tournamentId: string, registrationId: string): Observable<void> {
    return this.tournamentService.cancelRegistration(tournamentId, registrationId).pipe(
      tap(() => {
        // Rechargement des données du tournoi après annulation d'inscription
        if (this.currentTournamentSubject.value?.uuid === tournamentId) {
          this.loadTournament(tournamentId);
        }
      })
    );
  }

  getTournamentRegistrationCount(tournamentId: string): Observable<number> {
    return this.tournaments$.pipe(
      map(tournaments => {
        const tournament = tournaments.find(t => t.uuid === tournamentId);
        return tournament ? tournament.registrationsCount : 0;
      })
    );
  }

  getTournamentByUuid(uuid: string): Observable<Tournament | null> {
    return this.tournamentService.getTournamentByUuid(uuid);
  }
}
