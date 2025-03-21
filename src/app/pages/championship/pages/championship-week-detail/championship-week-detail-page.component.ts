import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, catchError, combineLatest, EMPTY, Observable, tap } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PlayerWeekScore } from "../../../../models/championship/player-week-score.model";
import { ChampionshipFacade } from "../../facades/championship.facade";
import { ChampionshipWeek } from "../../../../models/championship/championship-week.model";
import { ImportModalComponent } from "../../../../shared/components/import-modal/import-modal.component";
import { ToastService } from "../../../../shared/services/toast.service";
import { AuthFacade } from "../../../../shared/security/auth/facades/auth.facade";

type SortColumn = 'playerPseudo' | 'round1Points' | 'round2Points' | 'round3Points' | 'total';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-championship-week-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImportModalComponent],
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

  showImportDialog = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private championshipFacade: ChampionshipFacade,
    private toastService: ToastService,
    public authFacade: AuthFacade
  ) {
    this.selectedWeek$ = this.championshipFacade.selectedWeek$;
    this.loading$ = this.championshipFacade.loading$;

    const baseScores$ = this.selectedWeek$.pipe(
      filter(week => !!week),
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

  deletePlayerScore(playerScoreUuid: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce score?')) {
      const weekUuid = this.route.snapshot.params['uuid'];
      this.championshipFacade.deletePlayerScore(weekUuid, playerScoreUuid).subscribe();
    }
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

  openImportDialog(): void {
    this.showImportDialog = true;
  }

  closeImportDialog(): void {
    this.showImportDialog = false;
  }

  importData(file: File): void {
    const weekUuid = this.route.snapshot.params['uuid'];
    if (weekUuid) {
      this.championshipFacade.importChampionshipFromExcel(weekUuid, file).pipe(
        tap((response) => {
          this.toastService.success(
            `Importation réussie ! ${response.imported} enregistrements importés.`
          );
        }),
        catchError((error) => {
          this.toastService.error(
            `Erreur lors de l'importation : ${error.error?.message || 'Une erreur est survenue'}`
          );
          return EMPTY;
        })
      ).subscribe();
    }
    this.closeImportDialog();
  }
}
