import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastService } from '../../../../shared/services/toast.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChampionshipFacade } from "../../facades/championship.facade";
import { ChampionshipWeekFormComponent } from "../championship-week-form/championship-week-form.component";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-championship-week-create',
  standalone: true,
  templateUrl: './championship-week-create.component.html',
  imports: [
    ChampionshipWeekFormComponent,
    TranslatePipe
  ],
  styleUrls: ['./championship-week-create.component.css']
})
export class ChampionshipWeekCreateComponent {
  @Input() championshipId!: string;
  @Output() created = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  constructor(
    private championshipWeekFacade: ChampionshipFacade,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {
  }

  onSubmit(formData: any): void {
    this.championshipWeekFacade.createChampionshipWeek(formData)
      .pipe(
        tap(createdWeek => {
          this.toastService.success(this.translateService.instant('success.championship.week.create', {weekNumber: createdWeek.weekNumber}));
          this.created.emit(createdWeek);
        }),
        catchError(err => {
          this.toastService.error(this.translateService.instant('error.championship.week.create.week', {error: err.message || 'Erreur inconnue'}));
          return of(null);
        })
      )
      .subscribe();
  }

  onCancel(): void {
    this.close.emit();
  }
}
