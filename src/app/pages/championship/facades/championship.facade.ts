import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ChampionshipWeek } from "../../../models/championship/championship-week.model";
import { ChampionshipService } from "../services/championship.service";
import { ToastService } from "../../../shared/services/toast.service";
import { PlayerWeekScore } from "../../../models/championship/player-week-score.model";

@Injectable({
  providedIn: 'root'
})
export class ChampionshipFacade {
  private championshipWeeksSubject = new BehaviorSubject<ChampionshipWeek[]>([]);
  private selectedWeekSubject = new BehaviorSubject<ChampionshipWeek | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public championshipWeeks$ = this.championshipWeeksSubject.asObservable();
  public selectedWeek$ = this.selectedWeekSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private championshipService: ChampionshipService,
    private toastService: ToastService
  ) {
  }

  // Charger toutes les semaines de championnat
  loadChampionshipWeeks(): void {
    this.loadingSubject.next(true);
    this.championshipService.getChampionshipWeeks().pipe(
      tap(weeks => this.championshipWeeksSubject.next(weeks)),
      catchError(error => {
        this.toastService.error('Erreur lors du chargement des semaines de championnat');
        console.error('Erreur lors du chargement des semaines:', error);
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  // Charger les semaines par saison
  loadChampionshipWeeksBySeason(season: string): void {
    this.loadingSubject.next(true);
    this.championshipService.getChampionshipWeeksBySeason(season).pipe(
      tap(weeks => this.championshipWeeksSubject.next(weeks)),
      catchError(error => {
        this.toastService.error('Erreur lors du chargement des semaines de championnat');
        console.error('Erreur lors du chargement des semaines par saison:', error);
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  // Charger une semaine spécifique
  loadChampionshipWeek(uuid: string): void {
    this.loadingSubject.next(true);
    this.championshipService.getChampionshipWeek(uuid).pipe(
      tap(week => this.selectedWeekSubject.next(week)),
      catchError(error => {
        this.toastService.error('Erreur lors du chargement de la semaine de championnat');
        console.error('Erreur lors du chargement de la semaine:', error);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  // Créer une nouvelle semaine
  createChampionshipWeek(week: ChampionshipWeek): Observable<ChampionshipWeek> {
    this.loadingSubject.next(true);
    return this.championshipService.createChampionshipWeek(week).pipe(
      tap(createdWeek => {
        this.loadChampionshipWeeks();
        this.toastService.success('Semaine de championnat créée avec succès');
      }),
      catchError(error => {
        this.toastService.error('Erreur lors de la création de la semaine de championnat');
        console.error('Erreur lors de la création:', error);
        return of(null as unknown as ChampionshipWeek);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  // Mettre à jour une semaine
  updateChampionshipWeek(week: ChampionshipWeek): Observable<ChampionshipWeek> {
    this.loadingSubject.next(true);
    return this.championshipService.updateChampionshipWeek(week).pipe(
      tap(updatedWeek => {
        this.loadChampionshipWeeks();
        if (this.selectedWeekSubject.value?.uuid === week.uuid) {
          this.selectedWeekSubject.next(updatedWeek);
        }
        this.toastService.success('Semaine de championnat mise à jour avec succès');
      }),
      catchError(error => {
        this.toastService.error('Erreur lors de la mise à jour de la semaine de championnat');
        console.error('Erreur lors de la mise à jour:', error);
        return of(null as unknown as ChampionshipWeek);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  // Supprimer une semaine
  deleteChampionshipWeek(uuid: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.championshipService.deleteChampionshipWeek(uuid).pipe(
      tap(() => {
        this.loadChampionshipWeeks();
        if (this.selectedWeekSubject.value?.uuid === uuid) {
          this.selectedWeekSubject.next(null);
        }
        this.toastService.success('Semaine de championnat supprimée avec succès');
      }),
      catchError(error => {
        this.toastService.error('Erreur lors de la suppression de la semaine de championnat');
        console.error('Erreur lors de la suppression:', error);
        return of(undefined);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  // Ajouter un score joueur
  addPlayerScore(weekUuid: string, playerScore: PlayerWeekScore): Observable<PlayerWeekScore> {
    return this.championshipService.addPlayerScore(weekUuid, playerScore).pipe(
      tap(score => {
        this.loadChampionshipWeek(weekUuid);
        this.toastService.success('Score ajouté avec succès');
      }),
      catchError(error => {
        this.toastService.error("Erreur lors de l'ajout du score");
        console.error("Erreur lors de l'ajout du score:", error);
        return of(null as unknown as PlayerWeekScore);
      })
    );
  }

  // Mettre à jour un score joueur
  updatePlayerScore(weekUuid: string, playerScore: PlayerWeekScore): Observable<PlayerWeekScore> {
    return this.championshipService.updatePlayerScore(weekUuid, playerScore).pipe(
      tap(score => {
        this.loadChampionshipWeek(weekUuid);
        this.toastService.success('Score mis à jour avec succès');
      }),
      catchError(error => {
        this.toastService.error('Erreur lors de la mise à jour du score');
        console.error('Erreur lors de la mise à jour du score:', error);
        return of(null as unknown as PlayerWeekScore);
      })
    );
  }

  // Supprimer un score joueur
  deletePlayerScore(weekUuid: string, scoreUuid: string): Observable<void> {
    return this.championshipService.deletePlayerScore(weekUuid, scoreUuid).pipe(
      tap(() => {
        this.loadChampionshipWeek(weekUuid);
        this.toastService.success('Score supprimé avec succès');
      }),
      catchError(error => {
        this.toastService.error('Erreur lors de la suppression du score');
        console.error('Erreur lors de la suppression du score:', error);
        return of(undefined);
      })
    );
  }

  // Chargement de toutes les semaines avec filtre de saison optionnel
  loadAllWeeksBySeason(season?: string): void {
    this.loadingSubject.next(true);
    this.championshipService.getAllWeeksBySeason(season).pipe(
      tap(weeks => this.championshipWeeksSubject.next(weeks)),
      catchError(error => {
        this.toastService.error('Erreur lors du chargement des semaines');
        console.error('Erreur lors du chargement des semaines:', error);
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  loadAllWeeks(): void {
    this.loadingSubject.next(true);
    this.championshipService.getAllWeeks().pipe(
      tap(weeks => this.championshipWeeksSubject.next(weeks)),
      catchError(error => {
        this.toastService.error('Erreur lors du chargement des semaines');
        console.error('Erreur lors du chargement des semaines:', error);
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

}
