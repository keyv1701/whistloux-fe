import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ChampionshipWeek } from '../../../../models/championship/championship-week.model';
import { ChampionshipFacade } from '../../facades/championship.facade';
import { ToastService } from "../../../../shared/services/toast.service";
import { ConfirmationComponent } from "../../../../shared/components/confirmation/confirmation.component";
import {
  ChampionshipWeekCreateComponent
} from "../../components/championship-week-create/championship-week-create.component";
import {
  ChampionshipWeekEditComponent
} from "../../components/championship-week-edit/championship-week-edit.component";
import { AuthFacade } from "../../../../shared/security/auth/facades/auth.facade";
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-championship-week-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ChampionshipWeekCreateComponent, ConfirmationComponent, ChampionshipWeekEditComponent, TranslatePipe],
  templateUrl: './championship-week-list-page.component.html',
  styleUrls: ['./championship-week-list-page.component.css']
})
export class ChampionshipWeekListPageComponent implements OnInit {
  championshipWeeks$: Observable<ChampionshipWeek[]>;
  loading$: Observable<boolean>;
  selectedSeason: string = new Date().getFullYear().toString();
  seasons: string[] = [];
  showCreateForm = false;

  showEditForm = false;
  weekToEdit: any = null;

  showConfirmation = false;
  weekToDelete: any = null;

  constructor(
    private championshipFacade: ChampionshipFacade,
    private router: Router,
    private toastService: ToastService,
    public authFacade: AuthFacade,
    private translateService: TranslateService
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
    this.seasons.push(currentYear.toString());
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
    championshipWeek.season = this.selectedSeason;
    this.championshipFacade.createChampionshipWeek(championshipWeek).subscribe();
    this.showCreateForm = false;
    this.toastService.success(this.translateService.instant('success.championship.week.create.week'));
    // Recharger la liste des semaines
    this.loadChampionshipWeeks();
  }

  navigateToRankings(season: string): void {
    if (!season) {
      this.toastService.error(this.translateService.instant('error.championship.season.select'));
      return;
    }
    this.router.navigate(['/championship/results', season]);
  }

  onEditWeek(week: any, event: Event): void {
    event.stopPropagation();
    this.editChampionshipWeek(week);
  }

  editChampionshipWeek(week: any): void {
    this.showEditForm = true;
    this.weekToEdit = week;
  }

  onDeleteWeek(week: any, event: Event): void {
    event.stopPropagation();
    this.weekToDelete = week;
    this.showConfirmation = true;
  }

  confirmDelete(): void {
    if (this.weekToDelete) {
      this.championshipFacade.deleteChampionshipWeek(this.weekToDelete.uuid, this.selectedSeason)
        .pipe(
          tap(() => {
            this.toastService.success(this.translateService.instant('success.championship.week.delete', {weekNumber: this.weekToDelete.weekNumber}));
            this.loadChampionshipWeeks();
          }),
          catchError(err => {
            this.toastService.error(this.translateService.instant('error.championship.week.delete.week', {error: err.message || 'Erreur inconnue'}));
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
    this.weekToDelete = null;
  }

  onWeekUpdated(updatedWeek: any): void {
    this.showEditForm = false;
    this.weekToEdit = null;
    this.loadChampionshipWeeks();
    this.toastService.success(this.translateService.instant('success.championship.week.update.week', {weekNumber: updatedWeek.weekNumber}));
  }
}
