import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, finalize, Observable, throwError } from 'rxjs';
import { PlayerWhistBids } from '../../../models/bids/player-whist-bids.model';
import { WhistBidDetail } from '../../../models/bids/whist-bid-detail.model';
import { PlayerWhistBidsService } from '../services/player-whist-bids.service';
import { map, tap } from 'rxjs/operators';
import { WhistBidsWeek } from "../../../models/bids/whist-bids-week.model";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class PlayerWhistBidsFacade {
  private playerBidsSubject = new BehaviorSubject<PlayerWhistBids[]>([]);
  private currentPlayerBidsSubject = new BehaviorSubject<PlayerWhistBids | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public playerBids$ = this.playerBidsSubject.asObservable();
  public currentPlayerBids$ = this.currentPlayerBidsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(
    private playerWhistBidsService: PlayerWhistBidsService,
    private translateService: TranslateService
  ) {
  }

  loadBidsBySeason(season: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.playerWhistBidsService.getBidsBySeason(season)
      .pipe(
        tap(bids => this.playerBidsSubject.next(bids)),
        catchError(error => {
          this.errorSubject.next(this.translateService.instant('error.player.whist.bids.load'));
          return EMPTY;
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  loadBidsByPlayer(playerUuid: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.playerWhistBidsService.getBidsByPlayer(playerUuid)
      .pipe(
        tap(bids => this.playerBidsSubject.next(bids)),
        catchError(error => {
          this.errorSubject.next(this.translateService.instant('error.player.whist.bids.loadPlayer'));
          return EMPTY;
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  loadBidsByPlayerAndDate(playerUuid: string, season: string, date: string): Observable<WhistBidsWeek> {
    return this.playerWhistBidsService.getBidsByPlayerAndDate(playerUuid, season, date)
      .pipe(
        catchError(error => {
          this.errorSubject.next(this.translateService.instant('error.player.whist.bids.loadPlayer'));
          return EMPTY;
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  loadBidsBySeasonAndPlayer(season: string, playerUuid: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.playerWhistBidsService.getBidsBySeasonAndPlayer(season, playerUuid)
      .pipe(
        tap(bids => this.currentPlayerBidsSubject.next(bids)),
        catchError(error => {
          this.errorSubject.next(this.translateService.instant('error.player.whist.bids.loadPlayerSeason'));
          return EMPTY;
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  createPlayerBids(playerBids: PlayerWhistBids): Observable<PlayerWhistBids> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.playerWhistBidsService.createPlayerBids(playerBids)
      .pipe(
        tap(createdBids => this.updateStateAfterModification(createdBids)),
        catchError(error => {
          this.errorSubject.next(this.translateService.instant('error.player.whist.bids.create'));
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  updatePlayerBids(season: string, playerUuid: string, updatedBids: PlayerWhistBids): Observable<PlayerWhistBids> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.playerWhistBidsService.updatePlayerBids(season, playerUuid, updatedBids)
      .pipe(
        tap(updatedPlayerBids => this.updateStateAfterModification(updatedPlayerBids)),
        catchError(error => {
          this.errorSubject.next(this.translateService.instant('error.player.whist.bids.update'));
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  updatePlayerBidsWeek(season: string, playerUuid: string, weekDate: string, updatedWeek: WhistBidsWeek): Observable<PlayerWhistBids> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.playerWhistBidsService.updatePlayerBidsWeek(season, playerUuid, weekDate, updatedWeek)
      .pipe(
        tap(updatedPlayerBids => this.updateStateAfterModification(updatedPlayerBids)),
        catchError(error => {
          this.errorSubject.next(this.translateService.instant('error.player.whist.bids.updateWeek'));
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  deletePlayerBids(season: string, playerUuid: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.playerWhistBidsService.deletePlayerBids(season, playerUuid)
      .pipe(
        tap(() => {
          const currentBids = this.playerBidsSubject.getValue();
          this.playerBidsSubject.next(
            currentBids.filter(bid => !(bid.season === season && bid.playerUuid === playerUuid))
          );
          if (
            this.currentPlayerBidsSubject.getValue()?.season === season &&
            this.currentPlayerBidsSubject.getValue()?.playerUuid === playerUuid
          ) {
            this.currentPlayerBidsSubject.next(null);
          }
        }),
        catchError(error => {
          this.errorSubject.next(this.translateService.instant('error.player.whist.bids.delete'));
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  addBidDetail(season: string, playerUuid: string, bidDetail: WhistBidDetail): Observable<PlayerWhistBids> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.playerWhistBidsService.addBidDetail(season, playerUuid, bidDetail)
      .pipe(
        tap(updatedPlayerBids => this.updateStateAfterModification(updatedPlayerBids)),
        catchError(error => {
          this.errorSubject.next(this.translateService.instant('error.player.whist.bids.create'));
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  private updateStateAfterModification(modifiedBids: PlayerWhistBids): void {
    if (
      this.currentPlayerBidsSubject.getValue()?.season === modifiedBids.season &&
      this.currentPlayerBidsSubject.getValue()?.playerUuid === modifiedBids.playerUuid
    ) {
      this.currentPlayerBidsSubject.next(modifiedBids);
    }

    const currentBids = this.playerBidsSubject.getValue();
    const index = currentBids.findIndex(
      bid => bid.season === modifiedBids.season && bid.playerUuid === modifiedBids.playerUuid
    );

    if (index !== -1) {
      const updatedBids = [...currentBids];
      updatedBids[index] = modifiedBids;
      this.playerBidsSubject.next(updatedBids);
    } else {
      this.playerBidsSubject.next([...currentBids, modifiedBids]);
    }
  }

  exportSeasonBidsToExcel(season: string): Observable<void> {
    this.loadingSubject.next(true);

    return this.playerWhistBidsService.exportSeasonBidsToExcel(season).pipe(
      tap((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `annonces-whist-saison-${season}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }),
      map(() => void 0),
      catchError((error) => {
        this.errorSubject.next(this.translateService.instant('error.player.whist.bids.load'));
        console.error('Erreur lors de l\'exportation Excel:', error);
        return EMPTY;
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  importSeasonBidsFromExcel(season: string, file: File): Observable<any> {
    this.loadingSubject.next(true);

    return this.playerWhistBidsService.importSeasonBidsFromExcel(season, file).pipe(
      tap(response => {
        this.loadBidsBySeason(season);
        return response;
      }),
      catchError(error => {
        this.errorSubject.next(this.translateService.instant(error.error?.message || 'error.player.whist.bids.load'));
        console.error('Erreur lors de l\'importation Excel:', error);
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getLastFinalizedDate(season: string): Observable<Date | null> {
    return this.playerWhistBidsService.getLastFinalizedDate(season);
  }
}
