import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Tournament } from '../../../../models/tournament/tournament';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tournament-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tournament-edit.component.html',
  styleUrls: ['./tournament-edit.component.css']
})
export class TournamentEditComponent implements OnInit {
  @Input() tournament: Tournament | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Tournament>();

  tournamentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      address: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      maxPlayers: [0, [Validators.required, Validators.min(0)]],
      // Ajoutez d'autres champs selon votre modèle Tournament
    });
  }

  ngOnInit(): void {
    if (this.tournament) {
      // Formater les dates pour les champs input de type datetime-local
      const tournament = {...this.tournament};

      // Convertir les dates en format ISO pour les champs input
      if (tournament.startTime) {
        const startDate = new Date(tournament.startTime);
        tournament.startTime = this.formatDateForInput(startDate);
      }

      if (tournament.endTime) {
        const endDate = new Date(tournament.endTime);
        tournament.endTime = this.formatDateForInput(endDate);
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
    if (this.tournamentForm.valid && this.tournament) {
      const formValues = this.tournamentForm.value;

      // Convertir les chaînes de date en objets Date
      if (formValues.startTime) {
        formValues.startTime = new Date(formValues.startTime);
      }

      if (formValues.endTime) {
        formValues.endTime = new Date(formValues.endTime);
      }

      const updatedTournament: Tournament = {
        ...this.tournament,
        ...formValues
      };

      this.saved.emit(updatedTournament);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
