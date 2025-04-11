import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastService } from '../../../../shared/services/toast.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChampionshipFacade } from "../../facades/championship.facade";
import { ChampionshipWeekFormComponent } from "../championship-week-form/championship-week-form.component";

@Component({
  selector: 'app-championship-week-create',
  standalone: true,
  templateUrl: './championship-week-create.component.html',
  imports: [
    ChampionshipWeekFormComponent
  ],
  styleUrls: ['./championship-week-create.component.css']
})
export class ChampionshipWeekCreateComponent {
  @Input() championshipId!: string;
  @Output() created = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  constructor(
    private championshipWeekFacade: ChampionshipFacade,
    private toastService: ToastService
  ) {
  }

  onSubmit(formData: any): void {
    this.championshipWeekFacade.createChampionshipWeek(formData)
      .pipe(
        tap(createdWeek => {
          this.toastService.success(`La semaine ${createdWeek.weekNumber} a été créée avec succès!`);
          this.created.emit(createdWeek);
        }),
        catchError(err => {
          this.toastService.error(`Erreur lors de la création de la semaine: ${err.message || 'Erreur inconnue'}`);
          return of(null);
        })
      )
      .subscribe();
  }

  onCancel(): void {
    this.close.emit();
  }
}
