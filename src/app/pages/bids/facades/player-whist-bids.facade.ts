import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, finalize, Observable, throwError } from 'rxjs';
import { PlayerWhistBids } from '../../../models/bids/player-whist-bids.model';
import { WhistBidDetail } from '../../../models/bids/whist-bid-detail.model';
import { PlayerWhistBidsService } from '../services/player-whist-bids.service';
import { map, tap } from 'rxjs/operators';

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

  constructor(private playerWhistBidsService: PlayerWhistBidsService) {
  }

  loadBidsBySeason(season: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.playerWhistBidsService.getBidsBySeason(season)
      .pipe(
        tap(bids => this.playerBidsSubject.next(bids)),
        catchError(error => {
          this.errorSubject.next('Erreur lors du chargement des annonces pour la saison');
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
          this.errorSubject.next('Erreur lors du chargement des annonces pour le joueur');
          return EMPTY;
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  loadBidsBySeasonAndPlayer(season: string, playerUuid: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.playerWhistBidsService.getBidsBySeasonAndPlayer(season, playerUuid)
      .pipe(
        tap(bids => this.currentPlayerBidsSubject.next(bids)),
        catchError(error => {
          this.errorSubject.next('Erreur lors du chargement des annonces pour le joueur et la saison');
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
          this.errorSubject.next('Erreur lors de la création des annonces');
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
          this.errorSubject.next('Erreur lors de la mise à jour des annonces');
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
          // Mise à jour de l'état après suppression
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
          this.errorSubject.next('Erreur lors de la suppression des annonces');
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
          this.errorSubject.next('Erreur lors de l\'ajout d\'une annonce');
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  private updateStateAfterModification(modifiedBids: PlayerWhistBids): void {
    // Mise à jour de l'annonce courante si nécessaire
    if (
      this.currentPlayerBidsSubject.getValue()?.season === modifiedBids.season &&
      this.currentPlayerBidsSubject.getValue()?.playerUuid === modifiedBids.playerUuid
    ) {
      this.currentPlayerBidsSubject.next(modifiedBids);
    }

    // Mise à jour de la liste d'annonces
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
        this.errorSubject.next('Une erreur est survenue lors de l\'exportation des données.');
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
        // Recharger les données après l'importation
        this.loadBidsBySeason(season);
        return response;
      }),
      catchError(error => {
        this.errorSubject.next(error.error?.message || 'Une erreur est survenue lors de l\'importation des données.');
        console.error('Erreur lors de l\'importation Excel:', error);
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }
}
