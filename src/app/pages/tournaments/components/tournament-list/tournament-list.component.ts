import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tournament } from "../../../../models/tournament/tournament";
import { AuthFacade } from "../../../../shared/security/auth/facades/auth.facade";
import { TournamentEditComponent } from '../tournament-edit/tournament-edit.component';
import { TournamentCreateComponent } from "../tournament-create/tournament-create.component";
import { TournamentFacade } from "../../facades/tournament.facade";
import { ToastService } from "../../../../shared/services/toast.service";
import { tap } from "rxjs";
import { ConfirmationComponent } from "../../../../shared/components/confirmation/confirmation.component";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { TimeFormatPipe } from "../../../../shared/pipes/time-format.pipe";

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [
    CommonModule,
    TournamentEditComponent,
    TournamentCreateComponent,
    FormsModule,
    ConfirmationComponent,
    TranslatePipe,
    TimeFormatPipe
  ],
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.css']
})
export class TournamentListComponent implements OnInit {
  @Input() tournaments: Tournament[] = [];
  @Input() readOnly = false;
  @Output() selectTournament = new EventEmitter<Tournament>();
  @Output() deleteTournamentEvent = new EventEmitter<string>();
  @Output() tournamentUpdated = new EventEmitter<Tournament>();

  selectedTournament: Tournament | null = null;
  showCreateForm = false;
  showConfirmation = false;
  tournamentToDelete: Tournament | null = null;

  constructor(
    public authFacade: AuthFacade,
    public tournamentFacade: TournamentFacade,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.loadChampionshipWeeks();
  }

  private loadChampionshipWeeks(): void {
    this.tournamentFacade.loadTournaments();
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
    this.toastService.success(this.translateService.instant('success.tournament.list.create'));
    this.tournamentFacade.loadTournaments();
  }

  onTournamentSaved(updatedTournament: Tournament): void {
    this.selectedTournament = null;
    this.toastService.success(this.translateService.instant('success.tournament.list.update'));
    this.tournamentFacade.loadTournaments();
  }

  onDelete(tournament: Tournament, event: Event): void {
    event.stopPropagation();
    this.tournamentToDelete = tournament;
    this.showConfirmation = true;
  }

  confirmDelete(): void {
    if (this.tournamentToDelete) {
      this.tournamentFacade.deleteTournament(this.tournamentToDelete.uuid)
        .pipe(
          tap({
            next: () => {
              this.toastService.success(this.translateService.instant('success.tournament.list.delete', {name: this.tournamentToDelete?.name}));
              this.tournamentFacade.loadTournaments();
            },
            error: (err) => {
              this.toastService.error(this.translateService.instant('error.tournament.list.delete', {error: err.message || 'Erreur inconnue'}));
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
