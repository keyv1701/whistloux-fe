import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PlayerWeekScore } from "../../../../models/championship/player-week-score.model";
import { ChampionshipFacade } from "../../facades/championship.facade";
import { ChampionshipWeek } from "../../../../models/championship/championship-week.model";

@Component({
  selector: 'app-championship-week-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './championship-week-detail-page.component.html',
  styleUrls: ['./championship-week-detail-page.component.css']
})
export class ChampionshipWeekDetailPageComponent implements OnInit {
  selectedWeek$: Observable<ChampionshipWeek | null>;
  loading$: Observable<boolean>;
  playerScores$: Observable<PlayerWeekScore[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private championshipFacade: ChampionshipFacade
  ) {
    this.selectedWeek$ = this.championshipFacade.selectedWeek$;
    this.loading$ = this.championshipFacade.loading$;
    this.playerScores$ = this.selectedWeek$.pipe(
      filter(week => !!week),
      map(week => week?.playerScores || [])
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

  addPlayerScore(): void {
    // Cette méthode serait implémentée avec un formulaire ou un dialogue pour ajouter un nouveau score
    // Pour l'instant, c'est juste un emplacement
    console.log('Ajouter un score de joueur');
  }
}
