// src/app/pages/tournaments/components/tournament-detail/tournament-detail.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tournament } from '../../../../models/tournament.interface';
import { TournamentStatus } from '../../../../models/enums/tournament-status.enum';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tournament-detail.component.html',
  styleUrls: ['./tournament-detail.component.css']
})
export class TournamentDetailComponent implements OnInit {
  @Input() tournament: Tournament | null = null;

  TournamentStatus = TournamentStatus;

  constructor() { }

  ngOnInit(): void {
  }

  getStatusClass(status: TournamentStatus): string {
    switch (status) {
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

  isRegistrationOpen(): boolean {
    return this.tournament?.status === TournamentStatus.REGISTRATION_OPEN;
  }

  canRegister(): boolean {
    return this.isRegistrationOpen();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
