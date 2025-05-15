import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ChampionshipWeek } from "../../../models/championship/championship-week.model";
import { ChampionshipService } from "../services/championship.service";
import { ToastService } from "../../../shared/services/toast.service";
import { PlayerWeekScore } from "../../../models/championship/player-week-score.model";
import { PlayerRanking } from "../../../models/championship/player-ranking.model";
import { TranslateService } from "@ngx-translate/core";
import { PlayerWeekScoreRound } from "../../../models/championship/player-week-score-round.model";

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

  private monthlyRankingsSubject = new BehaviorSubject<PlayerRanking[]>([]);
  monthlyRankings$ = this.monthlyRankingsSubject.asObservable();

  constructor(
    private championshipService: ChampionshipService,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {
  }

  // Charger toutes les semaines de championnat
  loadChampionshipWeeks(): void {
    this.loadingSubject.next(true);
    this.championshipService.getChampionshipWeeks().pipe(
      tap(weeks => this.championshipWeeksSubject.next(weeks)),
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.championship.weeks.load'));
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
        this.toastService.error(this.translateService.instant('error.championship.weeks.load'));
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
        this.toastService.error(this.translateService.instant('error.championship.week.load'));
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
        this.loadAllWeeksBySeason(week.season);
        this.toastService.success(this.translateService.instant('error.championship.week.create.success'));
      }),
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.championship.week.create'));
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
        this.loadAllWeeksBySeason(week.season);
        if (this.selectedWeekSubject.value?.uuid === week.uuid) {
          this.selectedWeekSubject.next(updatedWeek);
        }
        this.toastService.success(this.translateService.instant('error.championship.week.update.success'));
      }),
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.championship.week.update'));
        console.error('Erreur lors de la mise à jour:', error);
        return of(null as unknown as ChampionshipWeek);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  deleteChampionshipWeek(uuid: string, season: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.championshipService.deleteChampionshipWeek(uuid).pipe(
      tap(() => {
        this.loadAllWeeksBySeason(season);
        if (this.selectedWeekSubject.value?.uuid === uuid) {
          this.selectedWeekSubject.next(null);
        }
        this.toastService.success(this.translateService.instant('error.championship.week.delete.success'));
      }),
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.championship.week.delete'));
        console.error('Erreur lors de la suppression:', error);
        return of(undefined);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  deletePlayerWeekScore(uuid: string, season: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.championshipService.deletePlayerWeekScore(uuid).pipe(
      tap(() => {
        this.toastService.success(this.translateService.instant('error.championship.score.delete.success'));
      }),
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.championship.score.delete'));
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
        this.toastService.success(this.translateService.instant('error.championship.score.add.success'));
      }),
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.championship.score.add'));
        console.error("Erreur lors de l'ajout du score:", error);
        return of(null as unknown as PlayerWeekScore);
      })
    );
  }

  createPlayerScore(playerScore: PlayerWeekScore, weekUuid: string): Observable<PlayerWeekScore> {
    return this.championshipService.addPlayerScore(weekUuid, playerScore).pipe(
      tap(score => {
        this.loadChampionshipWeek(weekUuid);
        this.toastService.success(this.translateService.instant('error.championship.score.create.success'));
      }),
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.championship.score.create'));
        return of(null as unknown as PlayerWeekScore);
      })
    );
  }

  createPlayerScoreRound(playerScoreRound: PlayerWeekScoreRound, weekUuid: string): Observable<PlayerWeekScoreRound> {
    return this.championshipService.addPlayerScoreRound(weekUuid, playerScoreRound).pipe(
      tap(score => {
        this.loadChampionshipWeek(weekUuid);
        this.toastService.success(this.translateService.instant('success.score.round.create'));
      }),
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.score.round.create'));
        return of(null as unknown as PlayerWeekScoreRound);
      })
    );
  }

  updatePlayerScore(playerScore: PlayerWeekScore, weekUuid: string): Observable<PlayerWeekScore> {
    return this.championshipService.updatePlayerScore(playerScore).pipe(
      tap(score => {
        this.loadChampionshipWeek(weekUuid);
        this.toastService.success(this.translateService.instant('error.championship.score.update.success'));
      }),
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.championship.score.update'));
        return of(null as unknown as PlayerWeekScore);
      })
    );
  }

  // Supprimer un score joueur
  deletePlayerScore(weekUuid: string, scoreUuid: string): Observable<void> {
    return this.championshipService.deletePlayerScore(weekUuid, scoreUuid).pipe(
      tap(() => {
        this.loadChampionshipWeek(weekUuid);
        this.toastService.success(this.translateService.instant('error.championship.score.delete.success'));
      }),
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.championship.score.delete'));
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
        this.toastService.error(this.translateService.instant('error.championship.weeks.load.all'));
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
        this.toastService.error(this.translateService.instant('error.championship.weeks.load.all'));
        console.error('Erreur lors du chargement des semaines:', error);
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  exportChampionshipToExcel(weekUuid: string): Observable<Blob> {
    return this.championshipService.exportChampionshipToExcel(weekUuid);
  }

  importChampionshipFromExcel(weekUuid: string, file: File): Observable<any> {
    this.loadingSubject.next(true);
    return this.championshipService.importChampionshipFromExcel(weekUuid, file).pipe(
      tap(() => {
        this.loadChampionshipWeek(weekUuid);
      }),
      catchError(error => {
        console.error('Erreur lors de l\'importation Excel:', error);
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getChampionshipRankings(season: string): Observable<PlayerRanking[]> {
    return this.championshipService.getChampionshipRankings(season);
  }

  private monthlyScoresSubject = new BehaviorSubject<PlayerWeekScore[]>([]);
  monthlyScores$ = this.monthlyScoresSubject.asObservable();

  loadMonthlyScores(season: string, month: number): Observable<PlayerWeekScore[]> {
    this.loadingSubject.next(true);

    return this.championshipService.getMonthlyScores(season, month).pipe(
      tap(scores => {
        this.monthlyScoresSubject.next(scores);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Error loading monthly scores', error);
        return throwError(() => error);
      })
    );
  }

  loadMonthlyChampionshipRankings(season: string, month: number): Observable<PlayerRanking[]> {
    this.loadingSubject.next(true);

    return this.championshipService.getMonthlyChampionshipRankings(season, month).pipe(
      tap(rankings => {
        this.monthlyRankingsSubject.next(rankings);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Error loading monthly rankings', error);
        return throwError(() => error);
      })
    );
  }

  exportMonthlyChampionshipRankingsToExcel(season: string, month: number): Observable<Blob> {
    this.loadingSubject.next(true);
    return this.championshipService.exportMonthlyChampionshipRankingsToExcel(season, month).pipe(
      tap(() => {
        this.toastService.success(this.translateService.instant('error.championship.rankings.export.success'));
      }),
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.championship.rankings.export'));
        console.error("Erreur lors de l'exportation du classement mensuel:", error);
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  checkNoExistingScoreForCurrentRound(weekUuid: string, roundDto: PlayerWeekScoreRound): Observable<boolean> {
    return this.championshipService.hasNoExistingScoreForCurrentRound(weekUuid, roundDto).pipe(
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.score.round.check'));
        return of(false);
      })
    );
  }

}
