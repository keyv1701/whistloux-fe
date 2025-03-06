// tournament-list.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, SlicePipe } from '@angular/common';
import { Tournament } from "../../../../models/tournament/tournament";
import { TimeFormatPipe } from "../../../../shared/pipes/time-format.pipe";
import { AuthFacade } from "../../../../shared/security/auth/facades/auth.facade";

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, AsyncPipe, DatePipe, SlicePipe, TimeFormatPipe],
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.css']
})
export class TournamentListComponent {
  @Input() tournaments: Tournament[] = [];
  @Input() readOnly = false;
  @Output() selectTournament = new EventEmitter<Tournament>();
  @Output() deleteTournamentEvent = new EventEmitter<string>();

  constructor(public authFacade: AuthFacade) {
  }

  onSelect(tournament: Tournament): void {
    this.selectTournament.emit(tournament);
  }

  onEdit(tournament: any, event: Event): void {
    event.stopPropagation(); // Pour éviter que l'événement ne se propage
    this.selectTournament.emit(tournament);
  }
}
