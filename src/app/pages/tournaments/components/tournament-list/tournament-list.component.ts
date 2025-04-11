import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, SlicePipe } from '@angular/common';
import { Tournament } from "../../../../models/tournament/tournament";
import { TimeFormatPipe } from "../../../../shared/pipes/time-format.pipe";
import { AuthFacade } from "../../../../shared/security/auth/facades/auth.facade";
import { TournamentEditComponent } from '../tournament-edit/tournament-edit.component';
import { TournamentCreateComponent } from "../tournament-create/tournament-create.component";
import { TournamentFacade } from "../../facades/tournament.facade";
import { ToastService } from "../../../../shared/services/toast.service";
import { tap } from "rxjs";
import { ConfirmationComponent } from "../../../../shared/components/confirmation/confirmation.component";
import { TranslatePipe } from "@ngx-translate/core";

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
    TournamentCreateComponent,
    ConfirmationComponent,
    TranslatePipe
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

  showConfirmation = false;
  tournamentToDelete: Tournament | null = null;

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

  onDelete(tournament: Tournament, event: Event): void {
    event.stopPropagation();
    this.tournamentToDelete = tournament;
    this.showConfirmation = true;
  }

  confirmDelete(): void {
    if (this.tournamentToDelete) {
      // Appel du service pour supprimer le tournoi
      this.tournamentFacade.deleteTournament(this.tournamentToDelete.uuid)
        .pipe(
          tap({
            next: () => {
              this.toastService.success(`Le tournoi ${this.tournamentToDelete?.name} a été supprimé avec succès!`);
              // Rafraîchir la liste des tournois
              this.tournamentFacade.loadTournaments();
            },
            error: (err) => {
              this.toastService.error(`Erreur lors de la suppression du tournoi: ${err.message || 'Erreur inconnue'}`);
            }
          })
        )
        .subscribe();
    }
    this.closeConfirmation();
  }

  closeConfirmation(): void {
    this.showConfirmation = false;
    this.tournamentToDelete = null;
  }
}
