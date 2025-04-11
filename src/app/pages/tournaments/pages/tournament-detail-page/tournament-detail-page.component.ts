import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentDetailComponent } from '../../components/tournament-detail/tournament-detail.component';
import { Tournament } from '../../../../models/tournament/tournament';
import { Observable, of, switchMap } from 'rxjs';
import { TournamentFacade } from "../../facades/tournament.facade";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-tournament-detail-page',
  standalone: true,
  imports: [CommonModule, TournamentDetailComponent, TranslatePipe],
  templateUrl: './tournament-detail-page.component.html',
  styleUrls: ['./tournament-detail-page.component.css']
})
export class TournamentDetailPageComponent implements OnInit {
  tournament$: Observable<Tournament | null> = of(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tournamentFacade: TournamentFacade
  ) {
  }

  ngOnInit(): void {
    this.tournament$ = this.route.paramMap.pipe(
      switchMap(params => {
        const uuid = params.get('uuid');
        if (uuid) {
          return this.tournamentFacade.getTournamentByUuid(uuid);
        }
        return of(null);
      })
    );
  }

  backToList(): void {
    this.router.navigate(['/tournaments']);
  }
}
