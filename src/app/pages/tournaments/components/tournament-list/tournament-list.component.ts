// tournament-list.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, SlicePipe } from '@angular/common';
import { Tournament } from '../../../../models/tournament.interface';
import { TournamentStatus } from '../../../../models/enums/tournament-status.enum';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, AsyncPipe, DatePipe, SlicePipe],
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.css']
})
export class TournamentListComponent {
  @Input() tournaments: Tournament[] = [];
  @Input() readOnly = false;
  @Output() selectTournament = new EventEmitter<Tournament>();
  @Output() deleteTournamentEvent = new EventEmitter<string>();

  getStatusClass(status: TournamentStatus): string {
    switch(status) {
      case TournamentStatus.REGISTRATION_OPEN:
        return 'status-open';
      case TournamentStatus.IN_PROGRESS:
        return 'status-progress';
      case TournamentStatus.COMPLETED:
        return 'status-completed';
      case TournamentStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  onSelect(tournament: Tournament): void {
    this.selectTournament.emit(tournament);
  }

  onDelete(uuid: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tournoi?')) {
      this.deleteTournamentEvent.emit(uuid);
    }
  }
}
