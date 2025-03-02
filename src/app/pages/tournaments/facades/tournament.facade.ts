import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, Observable, of, tap } from 'rxjs';
import { TournamentService } from '../services/tournament.service';
import { Tournament } from "../../../models/tournament.interface";

@Injectable({
  providedIn: 'root'
})
export class TournamentFacade {
  private tournamentsSubject = new BehaviorSubject<Tournament[]>([]);
  private selectedTournamentSubject = new BehaviorSubject<Tournament | undefined>(undefined);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | undefined>(undefined);

  public readonly tournaments$ = this.tournamentsSubject.asObservable();
  public readonly selectedTournament$ = this.selectedTournamentSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  constructor(private tournamentService: TournamentService) {}

  loadTournaments(): void {
    this.loadingSubject.next(true);
    this.tournamentService.getTournaments().pipe(
      tap(tournaments => this.tournamentsSubject.next(tournaments)),
      catchError(err => {
        this.errorSubject.next('Erreur lors du chargement des tournois');
        console.error(err);
        return of([] as Tournament[]);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  loadTournamentByUuid(uuid: string): void {
    this.loadingSubject.next(true);
    this.tournamentService.getTournamentByUuid(uuid).pipe(
      tap(tournament => this.selectedTournamentSubject.next(tournament)),
      catchError(err => {
        this.errorSubject.next('Erreur lors du chargement du tournoi');
        console.error(err);
        return of(undefined);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  getTournamentByUuid(uuid: string): Observable<Tournament | null> {
    this.loadingSubject.next(true);
    return this.tournamentService.getTournamentByUuid(uuid).pipe(
      tap(tournament => this.selectedTournamentSubject.next(tournament)),
      catchError(err => {
        this.errorSubject.next('Erreur lors du chargement du tournoi');
        console.error(err);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  createTournament(tournament: Tournament): void {
    this.loadingSubject.next(true);
    this.tournamentService.createTournament(tournament).pipe(
      tap(newTournament => {
        const currentTournaments = this.tournamentsSubject.getValue();
        this.tournamentsSubject.next([...currentTournaments, newTournament]);
      }),
      catchError(err => {
        this.errorSubject.next('Erreur lors de la création du tournoi');
        console.error(err);
        return of(undefined);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  updateTournament(tournament: Tournament): void {
    this.loadingSubject.next(true);
    this.tournamentService.updateTournament(tournament).pipe(
      tap(updatedTournament => {
        const currentTournaments = this.tournamentsSubject.getValue();
        const index = currentTournaments.findIndex(t => t.uuid === updatedTournament.uuid);
        if (index !== -1) {
          const updatedTournaments = [...currentTournaments];
          updatedTournaments[index] = {...updatedTournament};
          this.tournamentsSubject.next(updatedTournaments);
        }
      }),
      catchError(err => {
        this.errorSubject.next('Erreur lors de la mise à jour du tournoi');
        console.error(err);
        return of(undefined);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  deleteTournament(uuid: string): void {
    this.loadingSubject.next(true);
    this.tournamentService.deleteTournament(uuid).pipe(
      tap(() => {
        const currentTournaments = this.tournamentsSubject.getValue();
        this.tournamentsSubject.next(currentTournaments.filter(t => t.uuid !== uuid));
      }),
      catchError(err => {
        this.errorSubject.next('Erreur lors de la suppression du tournoi');
        console.error(err);
        return of(undefined);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  clearSelectedTournament(): void {
    this.selectedTournamentSubject.next(undefined);
  }

  clearError(): void {
    this.errorSubject.next(undefined);
  }
}
