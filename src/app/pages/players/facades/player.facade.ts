import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, finalize, Observable, of, tap} from 'rxjs';
import {PlayerService} from '../services/player.service';
import {Player} from "../../../models/player.interface";
import {ToastService} from "../../../shared/services/toast.service";
import {ErrorHandlingService} from "../../../shared/services/error-handling.service";

@Injectable({
  providedIn: 'root'
})
export class PlayerFacade {
  private playersSubject = new BehaviorSubject<Player[]>([]);
  private selectedPlayerSubject = new BehaviorSubject<Player | undefined>(undefined);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | undefined>(undefined);

  public readonly players$ = this.playersSubject.asObservable();
  public readonly selectedPlayer$ = this.selectedPlayerSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  constructor(
    private playerService: PlayerService,
    private toastService: ToastService,
    private errorHandlingService: ErrorHandlingService
  ) {
  }

  loadPlayers(): void {
    this.loadingSubject.next(true);
    this.playerService.getPlayers().pipe(
      tap(players => this.playersSubject.next(players)),
      catchError(err => {
        this.errorSubject.next('Erreur lors du chargement des joueurs');
        console.error(err);
        return of([] as Player[]);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  loadPlayerByUuid(uuid: string): void {
    this.loadingSubject.next(true);
    this.playerService.getPlayerByUuid(uuid).pipe(
      tap(player => this.selectedPlayerSubject.next(player)),
      catchError(err => {
        this.errorSubject.next('Erreur lors du chargement du joueur');
        console.error(err);
        return of(undefined);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  createPlayer(player: Player): void {
    this.loadingSubject.next(true);
    this.playerService.createPlayer(player).pipe(
      tap(newPlayer => {
        const currentPlayers = this.playersSubject.getValue();
        this.playersSubject.next([...currentPlayers, newPlayer]);
      }),
      catchError(err => {
        this.errorSubject.next('Erreur lors de la création du joueur');
        console.error(err);
        return of(undefined);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  updatePlayer(player: Player): void {
    this.loadingSubject.next(true);
    this.playerService.updatePlayer(player).pipe(
      tap(updatedPlayer => {
        const currentPlayers = this.playersSubject.getValue();
        const index = currentPlayers.findIndex(p => p.uuid === updatedPlayer.uuid);
        if (index !== -1) {
          const updatedPlayers = [...currentPlayers];
          updatedPlayers[index] = {...updatedPlayer};
          this.playersSubject.next(updatedPlayers);
        }
      }),
      catchError(err => {
        this.errorSubject.next('Erreur lors de la mise à jour du joueur');
        console.error(err);
        return of(undefined);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  deletePlayer(uuid: string): void {
    this.loadingSubject.next(true);
    this.playerService.deletePlayer(uuid).pipe(
      tap(() => {
        const currentPlayers = this.playersSubject.getValue();
        this.playersSubject.next(currentPlayers.filter(p => p.uuid !== uuid));
      }),
      catchError(err => {
        this.errorSubject.next('Erreur lors de la suppression du joueur');
        console.error(err);
        return of(undefined);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  clearSelectedPlayer(): void {
    this.selectedPlayerSubject.next(undefined);
  }

  clearError(): void {
    this.errorSubject.next(undefined);
  }

  exportPlayersToExcel(): void {
    this.loadingSubject.next(true);
    this.playerService.exportPlayersToExcel().pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `players_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }),
      catchError(err => {
        this.errorSubject.next('Erreur lors de l\'export des joueurs');
        console.error(err);
        return of(undefined);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  importPlayersFromExcel(file: File): Observable<string> {
    return this.playerService.importPlayersFromExcel(file).pipe(
      tap(message => {
        this.toastService.success('Import réussi');
        // Rafraîchir la liste des joueurs après l'import
        this.loadPlayers();
      }),
      catchError(error => {
        this.errorHandlingService.handleHttpError(
          error,
          'Une erreur est survenue lors de l\'importation'
        );
        throw error;
      })
    );
  }
}
