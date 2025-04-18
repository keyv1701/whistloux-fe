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
import { PseudoPipe } from "../../../../shared/pipes/pseudo.pipe";
import { WhistBidDetail } from "../../../../models/bids/whist-bid-detail.model";
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

type SortColumn = 'playerPseudo' | 'round1Points' | 'round2Points' | 'round3Points' | 'total';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-championship-week-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationComponent, PlayerScoreEditComponent, PlayerScoreEditComponent, PlayerScoreCreateComponent, PseudoPipe, TranslatePipe],
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
    public authFacade: AuthFacade,
    private translateService: TranslateService
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
          const today = new Date();
          const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          a.download = `championnat-semaine-${formattedDate}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }),
        catchError((error) => {
          this.toastService.error(this.translateService.instant('error.excel.create'));
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
        this.bidsToEdit = this.expandBidDetails(bids);
      })
    ).subscribe();
  }

  private expandBidDetails(bids: WhistBidsWeek | null): WhistBidsWeek | null {
    if (!bids) return null;

    const expandedBidDetails: WhistBidDetail[] = [];

    bids.bidDetails.forEach(detail => {
      if (detail.count > 1) {
        for (let i = 0; i < detail.count; i++) {
          expandedBidDetails.push({
            bidType: detail.bidType,
            count: 1,
            success: detail.success
          });
        }
      } else {
        expandedBidDetails.push({...detail});
      }
    });

    return {
      ...bids,
      bidDetails: expandedBidDetails
    };
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
        this.toastService.success(this.translateService.instant('success.score.update', {player: updatedScore.playerPseudo}));
        this.showScoreEditForm = false;
        this.scoreToEdit = null;
        this.championshipFacade.loadChampionshipWeek(this.weekUuid);
      }),
      catchError(err => {
        if (err.error?.message) {
          this.toastService.error(this.translateService.instant(err.error.message));
        } else {
          this.toastService.error(this.translateService.instant('error.score.update', {error: 'Erreur inconnue'}));
        }
        return of(null);
      })
    ).subscribe();
  }

  private updatePlayerScore(updatedScore: any): void {
    this.championshipFacade.updatePlayerScore(updatedScore, this.weekUuid)
      .pipe(
        tap(updatedWeek => {
          this.toastService.success(this.translateService.instant('success.score.update', {player: updatedScore.playerPseudo}));
          this.showScoreEditForm = false;
          this.scoreToEdit = null;
        }),
        catchError(err => {
          this.toastService.error(this.translateService.instant('error.score.update', {error: err.message || 'Erreur inconnue'}));
          return of(null);
        })
      )
      .subscribe();
  }

  onAddScoreClick(): void {
    this.showScoreCreateForm = true;
  }

  onScoreCreated(createdScore: any): void {
    this.createPlayerScore(createdScore);
    this.updatePlayerWhistBids(createdScore);
  }

  private createPlayerScore(createdScore: any) {
    this.championshipFacade.createPlayerScore(createdScore, this.weekUuid)
      .pipe(
        tap(updatedWeek => {
          this.toastService.success(this.translateService.instant('success.score.create', {player: createdScore.playerPseudo}));
          this.showScoreCreateForm = false;
        }),
        catchError(err => {
          if (err.error?.message) {
            this.toastService.error(this.translateService.instant(err.error.message));
          } else {
            this.toastService.error(this.translateService.instant('error.score.create', {error: 'Erreur inconnue'}));
          }
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
            this.toastService.success(this.translateService.instant('success.score.delete', {player: this.scoreToDelete.playerPseudo}));
            this.championshipFacade.loadChampionshipWeek(this.weekUuid);
          }),
          catchError(err => {
            this.toastService.error(this.translateService.instant('error.score.delete', {error: err.message || 'Erreur inconnue'}));
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
