// src/app/pages/tournaments/pages/tournament-admin/tournament-admin.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentFormComponent } from '../../components/tournament-form/tournament-form.component';
import { TournamentListComponent } from '../../components/tournament-list/tournament-list.component';
import { TournamentFacade } from '../../facades/tournament.facade';
import { NullToEmptyPipe } from "../../../../shared/pipes/null-to-empty.pipe";
import { Tournament } from "../../../../models/tournament/tournament";

@Component({
  selector: 'app-tournament-admin',
  standalone: true,
  imports: [CommonModule, TournamentFormComponent, TournamentListComponent, NullToEmptyPipe],
  templateUrl: './tournament-admin.component.html',
  styleUrls: ['./tournament-admin.component.css']
})
export class TournamentAdminComponent implements OnInit {
  selectedTournament: Tournament | undefined;

  constructor(public tournamentFacade: TournamentFacade) {
  }

  ngOnInit(): void {
    this.tournamentFacade.loadTournaments();
  }

  onSaveTournament(tournament: Tournament): void {
    if (tournament.uuid) {
      this.tournamentFacade.updateTournament(tournament);
    } else {
      this.tournamentFacade.createTournament(tournament);
    }
    this.selectedTournament = undefined;
  }

  onTournamentSelected(tournament: Tournament): void {
    this.selectedTournament = {...tournament};
  }

  onDeleteTournament(uuid: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ?')) {
      this.tournamentFacade.deleteTournament(uuid);
      if (this.selectedTournament?.uuid === uuid) {
        this.selectedTournament = undefined;
      }
    }
  }

  onCancelEdit(): void {
    this.selectedTournament = undefined;
  }
}
