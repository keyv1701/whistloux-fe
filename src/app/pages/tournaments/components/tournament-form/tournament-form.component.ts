// tournament-form.component.ts
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Tournament } from '../../../../models/tournament/tournament';
import { TournamentStatus } from '../../../../models/enums/tournament-status.enum';

@Component({
  selector: 'app-tournament-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule],
  templateUrl: './tournament-form.component.html',
  styleUrls: ['./tournament-form.component.css']
})
export class TournamentFormComponent implements OnInit, OnChanges {
  @Input() tournament: Tournament | undefined;
  @Output() saveTournament = new EventEmitter<Tournament>();
  @Output() cancelEdit = new EventEmitter<void>();

  tournamentForm!: FormGroup;
  tournamentStatuses = Object.values(TournamentStatus);
  isEditing = false;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournament'] && this.tournamentForm) {
      if (this.tournament) {
        this.tournamentForm.patchValue(this.tournament);
        this.isEditing = true;
      } else {
        this.resetForm();
      }
    }
  }

  initForm(): void {
    this.tournamentForm = this.fb.group({
      uuid: [''],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      location: ['', [Validators.required]],
      status: [TournamentStatus.PLANNED, [Validators.required]],
      maxParticipants: [0, [Validators.required, Validators.min(0)]],
      results: ['']
    });

    if (this.tournament) {
      this.tournamentForm.patchValue(this.tournament);
      this.isEditing = true;
    }
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      this.saveTournament.emit(this.tournamentForm.value);
    }
  }

  resetForm(): void {
    this.tournamentForm.reset({
      status: TournamentStatus.PLANNED,
      maxParticipants: 0
    });
    this.isEditing = false;
    this.cancelEdit.emit();
  }
}
