import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Tournament } from '../../../../models/tournament/tournament';
import { CommonModule } from '@angular/common';
import { TournamentFacade } from "../../facades/tournament.facade";
import { tap } from "rxjs";
import { ToastService } from "../../../../shared/services/toast.service";

@Component({
  selector: 'app-tournament-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tournament-form.component.html',
  styleUrls: ['./tournament-form.component.css']
})
export class TournamentFormComponent implements OnInit {
  @Input() tournament: Tournament | null = null;
  @Input() isEditMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Tournament>();

  tournamentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private tournamentFacade: TournamentFacade,
    private toastService: ToastService
  ) {
    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      address: ['', Validators.required],
      startTime: [''],
      endTime: [''],
      maxPlayers: [0, [Validators.required, Validators.min(0)]],
      registrationOpen: [true],
      registrationDeadline: [''],
      entryFee: [0],
      prizes: [''],
      format: [''],
      rules: [''],
      contactEmail: ['', Validators.email],
      contactPhone: [''],
      mainEvent: [false],
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

      if (tournament.endTime) {
        tournament.endTime = tournament.endTime; // déjà au format HH:MM dans le modèle
      }

      if (tournament.registrationDeadline) {
        const deadlineDate = new Date(tournament.registrationDeadline);
        tournament.registrationDeadline = deadlineDate;
      }

      this.tournamentForm.patchValue(tournament);
    }
  }

  private formatDateForInput(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '';
    }

    try {
      // Format YYYY-MM-DDThh:mm
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error("Erreur de conversion de date:", error, date);
      return '';
    }
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      const formValues = {...this.tournamentForm.value};
      const savedTournament = this.createSavedTournament(formValues);

      savedTournament.startTime = formValues.startTime;
      savedTournament.endTime = formValues.endTime;

      if (formValues.registrationDeadline) {
        savedTournament.registrationDeadline = new Date(formValues.registrationDeadline);
      }

      this.toastService.info(`Enregistrement du tournoi ${savedTournament.name}...`);
      this.saveAction(savedTournament);
    }
  }

  private createSavedTournament(formValues: Tournament): Tournament {
    if (this.tournament) {
      return {
        ...this.tournament,
        name: formValues.name,
        address: formValues.address,
        maxPlayers: formValues.maxPlayers,
        entryFee: formValues.entryFee,
        description: formValues.description,
        prizes: formValues.prizes
      };
    } else {
      return {
        city: "",
        contacts: [],
        handsPerRound: 0,
        includedItems: "",
        parkingInfo: "",
        postalCode: "",
        registrationInfo: undefined,
        registrations: [],
        rounds: 0,
        venue: "",
        uuid: '', // sera généré par le backend
        name: formValues.name,
        organization: '', // à remplir si nécessaire
        date: new Date(), // date actuelle par défaut
        isDateConfirmed: false,
        address: formValues.address,
        description: formValues.description,
        maxPlayers: formValues.maxPlayers,
        registrationsCount: 0, // nouveau tournoi, pas encore d'inscriptions
        startTime: formValues.startTime || '',
        endTime: formValues.endTime || '',
        registrationDeadline: formValues.registrationDeadline,
        entryFee: formValues.entryFee,
        prizes: formValues.prizes
      };
    }
  }

  private saveAction(updatedTournament: Tournament) {
    this.isEditMode ? this.updateForm(updatedTournament) : this.createForm(updatedTournament);
  }

  private updateForm(updatedTournament: Tournament) {
    this.tournamentFacade.updateTournament(updatedTournament)
      .pipe(
        tap({
          next: (result) => {
            this.toastService.success(`Le tournoi ${result.name} a été mis à jour avec succès !`);
            this.saved.emit(result);
            this.close.emit();
          },
          error: (err) => {
            this.toastService.error(`Erreur lors de la mise à jour du tournoi: ${err.message || 'Erreur inconnue'}`);
          }
        })
      )
      .subscribe();
  }

  private createForm(updatedTournament: Tournament) {
    this.tournamentFacade.createTournament(updatedTournament)
      .pipe(
        tap({
          next: (result) => {
            this.toastService.success(`Le tournoi ${result.name} a été créé avec succès !`);
            this.saved.emit(result);
            this.close.emit();
          },
          error: (err) => {
            this.toastService.error(`Erreur lors de la création du tournoi: ${err.message || 'Erreur inconnue'}`);
          }
        })
      )
      .subscribe();
  }

// Fonction utilitaire pour formater l'heure au format HH:MM
  onClose(): void {
    this.close.emit();
  }
}
