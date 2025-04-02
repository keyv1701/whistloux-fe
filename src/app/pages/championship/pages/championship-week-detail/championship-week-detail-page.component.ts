import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, catchError, combineLatest, EMPTY, Observable, of, tap } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PlayerWeekScore } from "../../../../models/championship/player-week-score.model";
import { ChampionshipFacade } from "../../facades/championship.facade";
import { ChampionshipWeek } from "../../../../models/championship/championship-week.model";
import { AuthFacade } from "../../../../shared/security/auth/facades/auth.facade";
import { ConfirmationComponent } from "../../../../shared/components/confirmation/confirmation.component";
import { ToastService } from "../../../../shared/services/toast.service";
import { PlayerScoreEditComponent } from "../../components/player-score-edit/player-score-edit.component";
import { PlayerScoreCreateComponent } from "../../components/player-score-create/player-score-create.component";
import { PlayerWhistBidsFacade } from "../../../bids/facades/player-whist-bids.facade";
import { WhistBidsWeek } from "../../../../models/bids/whist-bids-week.model";

type SortColumn = 'playerPseudo' | 'round1Points' | 'round2Points' | 'round3Points' | 'total';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-championship-week-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationComponent, PlayerScoreEditComponent, PlayerScoreEditComponent, PlayerScoreCreateComponent],
  templateUrl: './championship-week-detail-page.component.html',
  styleUrls: ['./championship-week-detail-page.component.css']
})
export class ChampionshipWeekDetailPageComponent implements OnInit {
  selectedWeek$: Observable<ChampionshipWeek | null>;
  loading$: Observable<boolean>;

  sortColumnSubject = new BehaviorSubject<SortColumn>('total');
  sortColumn$ = this.sortColumnSubject.asObservable();

  sortDirectionSubject = new BehaviorSubject<SortDirection>('desc');
  sortDirection$ = this.sortDirectionSubject.asObservable();

  playerScores$: Observable<PlayerWeekScore[]>;

  showConfirmation = false;
  scoreToDelete: any = null;

  showScoreEditForm = false;
  scoreToEdit: any = null;
  bidsToEdit: WhistBidsWeek | null = null;

  showScoreCreateForm = false;

  private weekUuid!: string;

  private selectedWeek: ChampionshipWeek | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private championshipFacade: ChampionshipFacade,
    private playerWhistBidsFacade: PlayerWhistBidsFacade,
    private toastService: ToastService,
    public authFacade: AuthFacade
  ) {
    this.selectedWeek$ = this.championshipFacade.selectedWeek$;
    this.loading$ = this.championshipFacade.loading$;

    const baseScores$ = this.selectedWeek$.pipe(
      filter(week => !!week),
      tap(week => this.selectedWeek = week),
      map(week => week?.playerScores || [])
    );

    this.playerScores$ = combineLatest([
      baseScores$,
      this.sortColumn$,
      this.sortDirection$
    ]).pipe(
      map(([scores, column, direction]) => this.sortScores(scores, column, direction))
    );
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['uuid']) {
        this.weekUuid = params['uuid'];
        this.championshipFacade.loadChampionshipWeek(params['uuid']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/championship']);
  }

  getTotalPoints(playerScore: PlayerWeekScore): number {
    let total = 0;
    if (playerScore.round1Points) total += playerScore.round1Points;
    if (playerScore.round2Points) total += playerScore.round2Points;
    if (playerScore.round3Points) total += playerScore.round3Points;
    return total;
  }

  sortData(column: SortColumn): void {
    const currentColumn = this.sortColumnSubject.value;
    const currentDirection = this.sortDirectionSubject.value;

    if (currentColumn === column) {
      // Inverser la direction si on clique sur la même colonne
      this.sortDirectionSubject.next(currentDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouvelle colonne, commencer par ordre ascendant
      this.sortColumnSubject.next(column);
      this.sortDirectionSubject.next('asc');
    }
  }

  private sortScores(scores: PlayerWeekScore[], column: SortColumn, direction: SortDirection): PlayerWeekScore[] {
    return [...scores].sort((a, b) => {
      let comparison = 0;

      switch (column) {
        case 'playerPseudo':
          comparison = a.playerPseudo.localeCompare(b.playerPseudo);
          break;
        case 'round1Points':
          comparison = (a.round1Points || 0) - (b.round1Points || 0);
          break;
        case 'round2Points':
          comparison = (a.round2Points || 0) - (b.round2Points || 0);
          break;
        case 'round3Points':
          comparison = (a.round3Points || 0) - (b.round3Points || 0);
          break;
        case 'total':
          comparison = this.getTotalPoints(a) - this.getTotalPoints(b);
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  getSortIcon(column: SortColumn): string {
    if (column !== this.sortColumnSubject.value) {
      return 'sort';
    }
    return this.sortDirectionSubject.value === 'asc' ? 'sort-up' : 'sort-down';
  }

  exportToExcel(): void {
    const weekUuid = this.route.snapshot.params['uuid'];
    if (weekUuid) {
      this.championshipFacade.exportChampionshipToExcel(weekUuid).pipe(
        tap((blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `championnat-semaine-${weekUuid}-${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }),
        catchError((error) => {
          console.error('Erreur lors de l\'export Excel:', error);
          return EMPTY;
        })
      ).subscribe();
    }
  }

  onEditClick(score: any): void {
    this.scoreToEdit = score;
    this.showScoreEditForm = true;
    this.playerWhistBidsFacade.loadBidsByPlayerAndDate(score.playerUuid, this.selectedWeek!.season, this.selectedWeek!.date.toString()).pipe(
      tap(bids => {
          this.bidsToEdit = bids;
        }
      )
    ).subscribe();
  }

  onScoreUpdated(updatedScore: any): void {
    this.updatePlayerScore(updatedScore);
    this.updatePlayerWhistBids(updatedScore);
  }

  private updatePlayerWhistBids(updatedScore: any) {
    const whistBidsWeek: WhistBidsWeek = {
      uuid: '',
      date: this.selectedWeek!.date,
      bidDetails: updatedScore.bidDetails
    }
    this.playerWhistBidsFacade.updatePlayerBidsWeek(this.selectedWeek!.season, updatedScore.playerUuid, this.selectedWeek!.date.toString(), whistBidsWeek).pipe(
      tap(updatedWeek => {
        this.toastService.success(`Le score de ${updatedScore.playerPseudo} a été mis à jour avec succès!`);
        this.showScoreEditForm = false;
        this.scoreToEdit = null;
      }),
      catchError(err => {
        this.toastService.error(`Erreur lors de la mise à jour du score: ${err.message || 'Erreur inconnue'}`);
        return of(null);
      })
    ).subscribe();
  }

  private updatePlayerScore(updatedScore: any): void {
    this.championshipFacade.updatePlayerScore(updatedScore, this.weekUuid)
      .pipe(
        tap(updatedWeek => {
          this.toastService.success(`Le score de ${updatedScore.playerPseudo} a été mis à jour avec succès!`);
          this.showScoreEditForm = false;
          this.scoreToEdit = null;
        }),
        catchError(err => {
          this.toastService.error(`Erreur lors de la mise à jour du score: ${err.message || 'Erreur inconnue'}`);
          return of(null);
        })
      )
      .subscribe();
  }

  onAddScoreClick(): void {
    this.showScoreCreateForm = true;
  }

  onScoreCreated(createdScore: any): void {
    this.championshipFacade.createPlayerScore(createdScore, this.weekUuid)
      .pipe(
        tap(updatedWeek => {
          this.toastService.success(`Le score de ${createdScore.playerPseudo} a été créé avec succès!`);
          this.showScoreCreateForm = false;
        }),
        catchError(err => {
          this.toastService.error(`Erreur lors de la création du score: ${err.message || 'Erreur inconnue'}`);
          return of(null);
        })
      )
      .subscribe();
  }

  onDeleteClick(score: any): void {
    this.scoreToDelete = score;
    this.showConfirmation = true;
  }

  confirmDelete(): void {
    if (this.scoreToDelete) {
      this.championshipFacade.deletePlayerWeekScore(this.scoreToDelete.uuid, this.scoreToDelete.season)
        .pipe(
          tap(() => {
            this.toastService.success(`Le score de ${this.scoreToDelete.playerPseudo} a été supprimé avec succès!`);
            // Rafraîchir la liste
            this.championshipFacade.loadChampionshipWeek(this.weekUuid);
          }),
          catchError(err => {
            this.toastService.error(`Erreur lors de la suppression du score: ${err.message || 'Erreur inconnue'}`);
            return of(null);
          })
        )
        .subscribe(() => {
          this.closeConfirmation();
        });
    } else {
      this.closeConfirmation();
    }
  }

  closeConfirmation(): void {
    this.showConfirmation = false;
    this.scoreToDelete = null;
  }
}
