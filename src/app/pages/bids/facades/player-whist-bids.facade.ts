import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, EMPTY, finalize, Observable} from 'rxjs';
import { PlayerWhistBids } from '../../../models/bids/player-whist-bids.model';
import { WhistBidDetail } from '../../../models/bids/whist-bid-detail.model';
import { PlayerWhistBidsService } from '../services/player-whist-bids.service';
import {map, tap} from 'rxjs/operators';

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

  constructor(private playerWhistBidsService: PlayerWhistBidsService) { }

  loadBidsBySeason(season: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.playerWhistBidsService.getBidsBySeason(season)
      .pipe(
        tap(() => this.loadingSubject.next(false))
      )
      .subscribe({
        next: (bids) => this.playerBidsSubject.next(bids),
        error: (error) => {
          this.errorSubject.next('Erreur lors du chargement des enchères pour la saison');
          this.loadingSubject.next(false);
        }
      });
  }

  loadBidsByPlayer(playerUuid: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.playerWhistBidsService.getBidsByPlayer(playerUuid)
      .pipe(
        tap(() => this.loadingSubject.next(false))
      )
      .subscribe({
        next: (bids) => this.playerBidsSubject.next(bids),
        error: (error) => {
          this.errorSubject.next('Erreur lors du chargement des enchères pour le joueur');
          this.loadingSubject.next(false);
        }
      });
  }

  loadBidsBySeasonAndPlayer(season: string, playerUuid: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.playerWhistBidsService.getBidsBySeasonAndPlayer(season, playerUuid)
      .pipe(
        tap(() => this.loadingSubject.next(false))
      )
      .subscribe({
        next: (bids) => this.currentPlayerBidsSubject.next(bids),
        error: (error) => {
          this.errorSubject.next('Erreur lors du chargement des enchères pour le joueur et la saison');
          this.loadingSubject.next(false);
        }
      });
  }

  createPlayerBids(playerBids: PlayerWhistBids): Observable<PlayerWhistBids> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.playerWhistBidsService.createPlayerBids(playerBids)
      .pipe(
        tap({
          next: (createdBids) => {
            this.loadingSubject.next(false);
            this.updateStateAfterModification(createdBids);
          },
          error: (error) => {
            this.errorSubject.next('Erreur lors de la création des enchères');
            this.loadingSubject.next(false);
          }
        })
      );
  }

  updatePlayerBids(season: string, playerUuid: string, updatedBids: PlayerWhistBids): Observable<PlayerWhistBids> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.playerWhistBidsService.updatePlayerBids(season, playerUuid, updatedBids)
      .pipe(
        tap({
          next: (updatedPlayerBids) => {
            this.loadingSubject.next(false);
            this.updateStateAfterModification(updatedPlayerBids);
          },
          error: (error) => {
            this.errorSubject.next('Erreur lors de la mise à jour des enchères');
            this.loadingSubject.next(false);
          }
        })
      );
  }

  deletePlayerBids(season: string, playerUuid: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.playerWhistBidsService.deletePlayerBids(season, playerUuid)
      .pipe(
        tap({
          next: () => {
            this.loadingSubject.next(false);
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
          },
          error: (error) => {
            this.errorSubject.next('Erreur lors de la suppression des enchères');
            this.loadingSubject.next(false);
          }
        })
      );
  }

  addBidDetail(season: string, playerUuid: string, bidDetail: WhistBidDetail): Observable<PlayerWhistBids> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.playerWhistBidsService.addBidDetail(season, playerUuid, bidDetail)
      .pipe(
        tap({
          next: (updatedPlayerBids) => {
            this.loadingSubject.next(false);
            this.updateStateAfterModification(updatedPlayerBids);
          },
          error: (error) => {
            this.errorSubject.next('Erreur lors de l\'ajout d\'une enchère');
            this.loadingSubject.next(false);
          }
        })
      );
  }

  private updateStateAfterModification(modifiedBids: PlayerWhistBids): void {
    // Mise à jour de l'enchère courante si nécessaire
    if (
      this.currentPlayerBidsSubject.getValue()?.season === modifiedBids.season &&
      this.currentPlayerBidsSubject.getValue()?.playerUuid === modifiedBids.playerUuid
    ) {
      this.currentPlayerBidsSubject.next(modifiedBids);
    }

    // Mise à jour de la liste d'enchères
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
        a.download = `encheres-whist-saison-${season}.xlsx`;
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
}
