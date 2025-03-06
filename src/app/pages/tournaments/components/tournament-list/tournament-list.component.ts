import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, SlicePipe } from '@angular/common';
import { Tournament } from "../../../../models/tournament/tournament";
import { TimeFormatPipe } from "../../../../shared/pipes/time-format.pipe";
import { AuthFacade } from "../../../../shared/security/auth/facades/auth.facade";
import { TournamentEditComponent } from '../tournament-edit/tournament-edit.component';
import { TournamentCreateComponent } from "../tournament-create/tournament-create.component";
import { TournamentFacade } from "../../facades/tournament.facade";
import { ToastService } from "../../../../shared/services/toast.service";

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
    TournamentEditComponent,
    TournamentCreateComponent
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

  showCreateForm = false;

  constructor(public authFacade: AuthFacade, public tournamentFacade: TournamentFacade,
              private toastService: ToastService) {
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

  onCreateTournament(): void {
    this.showCreateForm = true;
  }

  onCloseCreate(): void {
    this.showCreateForm = false;
  }

  onPlayerCreated(tournament: Tournament): void {
    this.showCreateForm = false;

    // Afficher une notification de succès
    this.toastService.success('Le tournoi a été créé avec succès');

    // Recharger la liste des joueurs
    this.tournamentFacade.loadTournaments();
  }

  onTournamentSaved(updatedTournament: Tournament): void {
    this.selectedTournament = null;

    // Afficher une notification de succès
    this.toastService.success('Le tournoi a été mis à jour avec succès');

    // Recharger la liste des joueurs
    this.tournamentFacade.loadTournaments();
  }
}
