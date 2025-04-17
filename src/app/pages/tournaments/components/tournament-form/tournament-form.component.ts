import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TournamentModel } from '../../../../models/tournament/tournament.model';
import { CommonModule } from '@angular/common';
import { TournamentFacade } from "../../facades/tournament.facade";
import { catchError, of } from "rxjs";
import { ToastService } from "../../../../shared/services/toast.service";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { map, take } from "rxjs/operators";

@Component({
  selector: 'app-tournament-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './tournament-form.component.html',
  styleUrls: ['./tournament-form.component.css']
})
export class TournamentFormComponent implements OnInit {
  @Input() tournament: TournamentModel | null = null;
  @Input() isEditMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<TournamentModel>();

  tournamentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private tournamentFacade: TournamentFacade,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {
    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      address: ['', Validators.required],
      parking: [''],
      date: ['', Validators.required],
      startTime: [''],
      endTime: [''],
      registrationsCount: [0],
      maxPlayers: [0, [Validators.required, Validators.min(0)]],
      registrationOpen: [true],
      registrationDeadline: [''],
      entryFee: [0],
      includedItems: [''],
      prizes: [''],
      contactEmail: ['', Validators.email],
      contactPhone: [''],
      status: ['PLANNED']
    });
  }

  ngOnInit(): void {
    if (this.tournament) {
      // Formater les dates pour les champs input de type datetime-local
      const tournament = {...this.tournament};

      // Convertir les dates en format ISO pour les champs input
      if (tournament.startTime) {
        tournament.startTime = tournament.startTime; // déjà au format HH:MM dans le modèle
      }

      if (tournament.registrationDeadline) {
        const deadlineDate = new Date(tournament.registrationDeadline);
        tournament.registrationDeadline = deadlineDate;
      }

      this.tournamentForm.patchValue(tournament);
    }
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      const formValues = {...this.tournamentForm.value};
      const savedTournament = this.createSavedTournament(formValues);

      savedTournament.startTime = formValues.startTime;

      if (formValues.registrationDeadline) {
        savedTournament.registrationDeadline = new Date(formValues.registrationDeadline);
      }

      this.toastService.info(this.translateService.instant('info.tournament.save', {name: savedTournament.name}));
      this.saveAction(savedTournament);
    }
  }

  private createSavedTournament(formValues: TournamentModel): TournamentModel {
    if (this.tournament) {
      return {
        ...this.tournament,
        name: formValues.name,
        address: formValues.address,
        parking: formValues.parking,
        registrationsCount: formValues.registrationsCount,
        maxPlayers: formValues.maxPlayers,
        entryFee: formValues.entryFee,
        description: formValues.description,
        prizes: formValues.prizes
      };
    } else {
      return {
        uuid: '', // sera généré par le backend
        name: formValues.name,
        description: formValues.description,
        address: formValues.address,
        parking: formValues.parking,
        date: formValues.date,
        startTime: formValues.startTime || '',
        maxPlayers: formValues.maxPlayers,
        registrationOpen: formValues.registrationOpen,
        registrationDeadline: formValues.registrationDeadline,
        registrationsCount: 0, // nouveau tournoi, pas encore d'inscriptions
        entryFee: formValues.entryFee,
        includedItems: formValues.includedItems,
        prizes: formValues.prizes,
        contactEmail: formValues.contactEmail,
        contactPhone: formValues.contactPhone,
        status: formValues.status
      };
    }
  }

  private saveAction(updatedTournament: TournamentModel) {
    this.isEditMode ? this.updateForm(updatedTournament) : this.createForm(updatedTournament);
  }

  private updateForm(updatedTournament: TournamentModel) {
    this.tournamentFacade.updateTournament(updatedTournament)
      .pipe(
        map(result => {
          this.toastService.success(this.translateService.instant('success.tournament.update', {name: result.name}));
          this.saved.emit(result);
          this.close.emit();
          return result;
        }),
        catchError(err => {
          this.toastService.error(this.translateService.instant('error.tournament.update',
            {error: err.message || 'Erreur inconnue'}));
          return of(null);
        }),
        take(1)
      )
      .subscribe();
  }

  private createForm(updatedTournament: TournamentModel) {
    this.tournamentFacade.createTournament(updatedTournament)
      .pipe(
        map(result => {
          this.toastService.success(this.translateService.instant('success.tournament.create', {name: result.name}));
          this.saved.emit(result);
          this.close.emit();
          return result;
        }),
        catchError(err => {
          this.toastService.error(this.translateService.instant('error.tournament.create',
            {error: err.message || 'Erreur inconnue'}));
          return of(null);
        }),
        take(1)
      )
      .subscribe();
  }

  onClose(): void {
    this.close.emit();
  }
}
