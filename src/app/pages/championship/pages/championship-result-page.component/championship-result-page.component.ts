import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ChampionshipFacade } from '../../facades/championship.facade';
import { PlayerRanking } from '../../../../models/championship/player-ranking.model';
import { take } from "rxjs/operators";

@Component({
  selector: 'app-championship-result-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private championshipFacade: ChampionshipFacade,
    private route: ActivatedRoute
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
  }

  onMonthChange(month: number): void {
    this.selectedMonth = month;
    this.loadMonthlyRankings();
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
}
