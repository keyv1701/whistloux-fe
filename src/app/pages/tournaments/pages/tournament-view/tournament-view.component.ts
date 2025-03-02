// src/app/pages/tournaments/pages/tournament-view/tournament-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TournamentDetailComponent } from '../../components/tournament-detail/tournament-detail.component';
import { TournamentListComponent } from '../../components/tournament-list/tournament-list.component';
import { TournamentFacade } from '../../facades/tournament.facade';
import { Tournament } from '../../../../models/tournament.interface';
import { Observable, switchMap, of } from 'rxjs';
import { NullToEmptyPipe } from "../../../../shared/pipes/null-to-empty.pipe";

@Component({
  selector: 'app-tournament-view',
  standalone: true,
  imports: [CommonModule, RouterModule, TournamentDetailComponent, TournamentListComponent, NullToEmptyPipe],
  templateUrl: './tournament-view.component.html',
  styleUrls: ['./tournament-view.component.css']
})
export class TournamentViewComponent implements OnInit {
  selectedTournament$: Observable<Tournament | null> = of(null);
  selectedUuid: string | null = null;

  constructor(
    public tournamentFacade: TournamentFacade,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.tournamentFacade.loadTournaments();

    this.selectedTournament$ = this.route.paramMap.pipe(
      switchMap(params => {
        const uuid = params.get('uuid');
        this.selectedUuid = uuid;

        if (uuid) {
          return this.tournamentFacade.getTournamentByUuid(uuid);
        }
        return of(null);
      })
    );
  }

  onSelectTournament(tournament: Tournament): void {
    this.router.navigate(['/tournaments', tournament.uuid]);
  }

  backToList(): void {
    this.router.navigate(['/tournaments']);
  }
}
