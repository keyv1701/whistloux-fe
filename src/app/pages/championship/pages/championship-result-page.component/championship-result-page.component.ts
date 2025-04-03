import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, Observable, of, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ChampionshipFacade } from '../../facades/championship.facade';
import { PlayerRanking } from '../../../../models/championship/player-ranking.model';
import { take } from "rxjs/operators";
import { LotteryWinnerService } from "../../../../shared/services/lottery-winner.service";
import { LotteryWinner } from "../../../../models/lottery-winner/lottery-winner.model";
import { ConfirmationComponent } from "../../../../shared/components/confirmation/confirmation.component";
import { AuthFacade } from "../../../../shared/security/auth/facades/auth.facade";
import { ToastService } from "../../../../shared/services/toast.service";
import { PseudoPipe } from "../../../../shared/pipes/pseudo.pipe";

@Component({
  selector: 'app-championship-result-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationComponent, PseudoPipe],
  templateUrl: './championship-result-page.component.html',
  styleUrls: ['./championship-result-page.component.css']
})
export class ChampionshipResultPageComponent implements OnInit {
  monthlyRankings$: Observable<PlayerRanking[]>;
  loading$: Observable<boolean>;

  seasons: string[] = [];
  selectedSeason: string = new Date().getFullYear().toString();

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  showAddConfirmation = false;
  showRemoveConfirmation = false;
  playerToSetAsWinner: any = null;
  playerToRemoveAsWinner: any = null;
  winnerUuidToRemove: string | null = null;

  months = [
    {value: 1, name: 'Janvier'},
    {value: 2, name: 'Février'},
    {value: 3, name: 'Mars'},
    {value: 4, name: 'Avril'},
    {value: 5, name: 'Mai'},
    {value: 6, name: 'Juin'},
    {value: 7, name: 'Juillet'},
    {value: 8, name: 'Août'},
    {value: 9, name: 'Septembre'},
    {value: 10, name: 'Octobre'},
    {value: 11, name: 'Novembre'},
    {value: 12, name: 'Décembre'}
  ];
  selectedMonth: number = new Date().getMonth() + 1;

  lotteryWinners: LotteryWinner[] = [];

  constructor(
    private championshipFacade: ChampionshipFacade,
    private route: ActivatedRoute,
    private lotteryWinnerService: LotteryWinnerService,
    public authFacade: AuthFacade,
    private toastService: ToastService
  ) {
    this.monthlyRankings$ = this.championshipFacade.monthlyRankings$;
    this.loading$ = this.championshipFacade.loading$;
    this.initializeSeasons();
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        const season = params['season'] || this.selectedSeason;
        this.selectedSeason = season;
        return this.championshipFacade.loadMonthlyChampionshipRankings(season, this.selectedMonth);
      }),
      finalize(() => {
        this.loadLotteryWinners();
      })
    ).subscribe();
  }

  loadLotteryWinners(): void {
    this.lotteryWinnerService.getWinnersBySeasonAndMonth(this.selectedSeason, this.selectedMonth)
      .pipe(
        tap(winners => {
          this.lotteryWinners = winners;
        }),
        catchError(error => {
          if (error.error?.message) {
            this.toastService.error(error.error.message);
          } else {
            this.toastService.error('Erreur lors du chargement des gagnants de la loterie');
          }

          return of([]);
        })
      ).subscribe();
  }

  private initializeSeasons(): void {
    const currentYear = new Date().getFullYear();
    this.seasons = [(currentYear).toString()];
  }

  onSeasonChange(season: string): void {
    this.selectedSeason = season;
    this.loadMonthlyRankings();
    this.loadLotteryWinners();
  }

  onMonthChange(month: number): void {
    this.selectedMonth = month;
    this.loadMonthlyRankings();
    this.loadLotteryWinners();
  }

  loadMonthlyRankings(): void {
    this.championshipFacade.loadMonthlyChampionshipRankings(this.selectedSeason, this.selectedMonth).subscribe();
  }

  exportMonthlyRankings(): void {
    this.championshipFacade.exportMonthlyChampionshipRankingsToExcel(this.selectedSeason, this.selectedMonth)
      .subscribe((blob: Blob) => {
        // Créer un lien temporaire pour télécharger le fichier
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `classement_mensuel_${this.selectedSeason}_${this.months[this.selectedMonth - 1].name}.xlsx`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
  }

  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.sortMonthlyRankings(this.sortColumn, this.sortDirection);
  }

  sortMonthlyRankings(column: string, direction: 'asc' | 'desc'): void {
    this.championshipFacade.monthlyRankings$.pipe(
      take(1),
      tap(rankings => {
        const sortedRankings = [...rankings].sort((a, b) => {
          let comparison = 0;

          switch (column) {
            case 'rank':
              comparison = a.rank - b.rank;
              break;
            case 'playerPseudo':
              comparison = a.playerPseudo.localeCompare(b.playerPseudo, 'fr', {sensitivity: 'base'});
              break;
            case 'totalScore':
              comparison = a.totalScore - b.totalScore;
              break;
            case 'roundsPlayed':
              comparison = a.roundsPlayed - b.roundsPlayed;
              break;
            case 'worstRoundScore':
              comparison = a.worstRoundScore - b.worstRoundScore;
              break;
            default:
              return 0;
          }

          return direction === 'asc' ? comparison : -comparison;
        });

        // On met à jour le BehaviorSubject dans la façade
        (this.championshipFacade as any).monthlyRankingsSubject.next(sortedRankings);
      })
    ).subscribe();
  }

  selectLotteryWinner(player: any): void {
    const isWinner = this.isLotteryWinner(player.playerUuid);

    if (isWinner) {
      // Cas de suppression
      this.playerToRemoveAsWinner = player;
      const winner = this.lotteryWinners.find(w => w.playerUuid === player.playerUuid);
      this.winnerUuidToRemove = winner ? winner.uuid : null;
      this.showRemoveConfirmation = true;
    } else {
      // Cas d'ajout
      this.playerToSetAsWinner = player;
      this.showAddConfirmation = true;
    }
  }

  confirmSetLotteryWinner(): void {
    if (this.playerToSetAsWinner && this.selectedSeason) {
      const lotteryWinner: LotteryWinner = {
        uuid: '', // Sera généré par le backend
        playerUuid: this.playerToSetAsWinner.playerUuid,
        season: this.selectedSeason,
        monthNumber: this.selectedMonth
      };

      this.lotteryWinnerService.createWinner(lotteryWinner).pipe(
        tap(() => {
          this.toastService.success(`Le joueur a été désigné comme l'un des gagnants de la loterie pour le mois ${this.selectedMonth}`);
          this.loadLotteryWinners();
        }),
        catchError((error) => {
          if (error.error?.message) {
            this.toastService.error(error.error.message);
          } else {
            this.toastService.error('Une erreur est survenue lors de la désignation du gagnant de la loterie');
          }
          return of(null);
        }),
        finalize(() => {
          this.closeAddConfirmation();
        })
      ).subscribe();
    }
  }

  confirmRemoveLotteryWinner(): void {
    if (this.winnerUuidToRemove) {
      this.lotteryWinnerService.deleteWinner(this.winnerUuidToRemove).pipe(
        tap(() => {
          this.toastService.success(`Le joueur a été retiré des gagnants de la loterie pour le mois ${this.selectedMonth}`);
          this.loadLotteryWinners();
        }),
        catchError((error) => {
          this.toastService.error('Une erreur est survenue lors du retrait du gagnant de la loterie');
          return of(null);
        }),
        finalize(() => {
          this.closeRemoveConfirmation();
        })
      ).subscribe();
    }
  }

  closeAddConfirmation(): void {
    this.showAddConfirmation = false;
    this.playerToSetAsWinner = null;
  }

  closeRemoveConfirmation(): void {
    this.showRemoveConfirmation = false;
    this.playerToRemoveAsWinner = null;
    this.winnerUuidToRemove = null;
  }

  isLotteryWinner(playerUuid: string): boolean {
    return this.lotteryWinners.some(winner => winner.playerUuid === playerUuid);
  }
}
