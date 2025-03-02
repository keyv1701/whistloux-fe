import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, SlicePipe } from '@angular/common';
import { TournamentFacade } from "../facades/tournament.facade";
import { Tournament } from "../../../models/tournament.interface";
import { TournamentStatus } from "../../../models/enums/tournament-status.enum";
import { distinctUntilChanged, Subject, takeUntil, tap } from "rxjs";

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ReactiveFormsModule, AsyncPipe, DatePipe, SlicePipe],
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css']
})
export class TournamentComponent implements OnInit, OnDestroy {
  tournamentForm: FormGroup;
  isEditing = false;
  tournamentStatuses = Object.values(TournamentStatus);
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public tournamentFacade: TournamentFacade
  ) {
    this.tournamentForm = this.fb.group({
      uuid: [''],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      location: ['', [Validators.required]],
      status: [TournamentStatus.PLANNED, [Validators.required]],
      results: [''],
      maxParticipants: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.tournamentFacade.loadTournaments();

    this.tournamentFacade.selectedTournament$.pipe(
      distinctUntilChanged((prev, curr) => {
        if (!prev && !curr) return true;
        if (!prev || !curr) return false;
        return prev.uuid === curr.uuid;
      }),
      tap(tournament => {
        if (tournament) {
          // Format dates for form controls (assuming ISO format)
          const formattedTournament = {
            ...tournament,
            startDate: tournament.startDate ? tournament.startDate.split('T')[0] : '',
            endDate: tournament.endDate ? tournament.endDate.split('T')[0] : ''
          };
          this.tournamentForm.patchValue(formattedTournament);
          this.isEditing = true;
        } else {
          if (this.isEditing) {
            this.tournamentForm.reset({
              status: TournamentStatus.PLANNED,
              maxParticipants: 0
            });
            this.isEditing = false;
          }
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      const tournament: Tournament = this.tournamentForm.value;

      if (this.isEditing) {
        this.tournamentFacade.updateTournament(tournament);
      } else {
        this.tournamentFacade.createTournament(tournament);
      }

      this.resetForm();
    }
  }

  selectTournament(tournament: Tournament): void {
    this.tournamentFacade.loadTournamentByUuid(tournament.uuid!);
  }

  deleteTournament(uuid: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tournoi?')) {
      this.tournamentFacade.deleteTournament(uuid);
    }
  }

  resetForm(): void {
    this.tournamentForm.reset({
      status: TournamentStatus.PLANNED,
      maxParticipants: 0
    });
    this.isEditing = false;
    this.tournamentFacade.clearSelectedTournament();
  }

  dismissError(): void {
    this.tournamentFacade.clearError();
  }

  getStatusClass(status: TournamentStatus): string {
    switch (status) {
      case TournamentStatus.REGISTRATION_OPEN: return 'status-open';
      case TournamentStatus.IN_PROGRESS: return 'status-progress';
      case TournamentStatus.COMPLETED: return 'status-completed';
      case TournamentStatus.CANCELLED: return 'status-cancelled';
      default: return '';
    }
  }
}
