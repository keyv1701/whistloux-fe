// src/app/pages/championship/pages/championship-week-list-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ChampionshipWeek } from '../../../../models/championship/championship-week.model';
import { ChampionshipFacade } from '../../facades/championship.facade';
import { ToastService } from "../../../../shared/services/toast.service";
import {
  ChampionshipWeekCreateComponent
} from "../../components/championship-week-create/championship-week-create.component";

@Component({
  selector: 'app-championship-week-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ChampionshipWeekCreateComponent],
  templateUrl: './championship-week-list-page.component.html',
  styleUrls: ['./championship-week-list-page.component.css']
})
export class ChampionshipWeekListPageComponent implements OnInit {
  championshipWeeks$: Observable<ChampionshipWeek[]>;
  loading$: Observable<boolean>;
  selectedSeason: string = new Date().getFullYear().toString();
  seasons: string[] = [];
  showCreateForm = false;

  constructor(
    private championshipFacade: ChampionshipFacade,
    private router: Router,
    private toastService: ToastService
  ) {
    this.championshipWeeks$ = this.championshipFacade.championshipWeeks$;
    this.loading$ = this.championshipFacade.loading$;
    this.initializeSeasons();
  }

  ngOnInit(): void {
    this.loadChampionshipWeeks();
  }

  private initializeSeasons(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 5; i++) {
      this.seasons.push((currentYear - i).toString());
    }
  }

  loadChampionshipWeeks(): void {
    this.championshipFacade.loadAllWeeksBySeason(this.selectedSeason);
  }

  onSeasonChange(season: string): void {
    this.selectedSeason = season;
    this.loadChampionshipWeeks();
  }

  navigateToDetail(uuid?: string): void {
    if (uuid) {
      this.router.navigate(['/championship/week', uuid]);
    }
  }

  addChampionshipWeek(): void {
    this.showCreateForm = true;
  }

  onCloseCreate(): void {
    this.showCreateForm = false;
  }

  onWeekCreated(championshipWeek: ChampionshipWeek): void {
    this.championshipFacade.createChampionshipWeek(championshipWeek).subscribe();
    this.showCreateForm = false;

    this.toastService.success('La semaine a été créée avec succès');

    // Recharger la liste des semaines
    this.loadChampionshipWeeks();
  }
}
