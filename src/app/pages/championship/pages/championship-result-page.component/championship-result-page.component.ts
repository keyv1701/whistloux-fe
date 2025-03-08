// src/app/pages/championship/pages/championship-result/championship-result-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { ChampionshipFacade } from '../../facades/championship.facade';
import {PlayerRanking} from "../../../../models/championship/player-ranking.model";

@Component({
  selector: 'app-championship-result-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './championship-result-page.component.html',
  styleUrls: ['./championship-result-page.component.css']
})
export class ChampionshipResultPageComponent implements OnInit {
  playerRankings$: Observable<PlayerRanking[]>;
  season: string;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private championshipFacade: ChampionshipFacade
  ) {
    this.season = this.route.snapshot.paramMap.get('season') || new Date().getFullYear().toString();
    this.playerRankings$ = this.championshipFacade.getChampionshipRankings(this.season);
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.season = params.get('season') || new Date().getFullYear().toString();
        this.loading = true;
        return this.championshipFacade.getChampionshipRankings(this.season);
      })
    ).subscribe({
      next: () => this.loading = false,
      error: () => this.loading = false
    });
  }
}
