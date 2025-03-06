import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, SlicePipe } from '@angular/common';
import { Tournament } from "../../../../models/tournament/tournament";
import { TimeFormatPipe } from "../../../../shared/pipes/time-format.pipe";
import { AuthFacade } from "../../../../shared/security/auth/facades/auth.facade";
import { TournamentEditComponent } from '../tournament-edit/tournament-edit.component';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    DatePipe,
    SlicePipe,
    TimeFormatPipe,
    TournamentEditComponent
  ],
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.css']
})
export class TournamentListComponent {
  @Input() tournaments: Tournament[] = [];
  @Input() readOnly = false;
  @Output() selectTournament = new EventEmitter<Tournament>();
  @Output() deleteTournamentEvent = new EventEmitter<string>();
  @Output() tournamentUpdated = new EventEmitter<Tournament>();

  selectedTournament: Tournament | null = null;

  constructor(public authFacade: AuthFacade) {
  }

  onSelect(tournament: Tournament): void {
    this.selectTournament.emit(tournament);
  }

  onEdit(tournament: Tournament, event: Event): void {
    event.stopPropagation(); // Pour éviter que l'événement ne se propage
    this.selectedTournament = tournament;
  }

  onDelete(uuid: string, event: Event): void {
    event.stopPropagation();
    this.deleteTournamentEvent.emit(uuid);
  }

  onCloseEdit(): void {
    this.selectedTournament = null;
  }

  onTournamentSaved(updatedTournament: Tournament): void {
    this.tournamentUpdated.emit(updatedTournament);
    this.selectedTournament = null;
  }
}
