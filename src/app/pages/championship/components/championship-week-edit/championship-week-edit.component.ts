import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastService } from '../../../../shared/services/toast.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChampionshipFacade } from "../../facades/championship.facade";
import { ChampionshipWeek } from "../../../../models/championship/championship-week.model";
import { ChampionshipWeekFormComponent } from "../championship-week-form/championship-week-form.component";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-championship-week-edit',
  standalone: true,
  templateUrl: './championship-week-edit.component.html',
  imports: [
    ChampionshipWeekFormComponent,
    TranslatePipe
  ],
  styleUrls: ['./championship-week-edit.component.css']
})
export class ChampionshipWeekEditComponent implements OnInit {
  @Input() week!: ChampionshipWeek;
  @Output() saved = new EventEmitter<ChampionshipWeek>();
  @Output() close = new EventEmitter<void>();

  championshipUuid: string = '';

  constructor(
    private championshipWeekFacade: ChampionshipFacade,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    if (this.week) {
      this.championshipUuid = this.week.uuid;
    }
  }

  onSubmit(formData: any): void {
    this.championshipWeekFacade.updateChampionshipWeek(formData)
      .pipe(
        tap(updatedWeek => {
          this.toastService.success(this.translateService.instant('success.championship.week.update', {weekNumber: updatedWeek.weekNumber}));
          this.saved.emit(updatedWeek);
        }),
        catchError(err => {
          this.toastService.error(this.translateService.instant('error.championship.week.update.week', {error: err.message || 'Erreur inconnue'}));
          return of(null);
        })
      )
      .subscribe();
  }

  onCancel(): void {
    this.close.emit();
  }
}
