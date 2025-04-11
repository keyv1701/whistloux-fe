import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../../models/players/player.interface';
import { catchError, of, tap } from "rxjs";
import { ToastService } from "../../../../shared/services/toast.service";
import { ConfirmationComponent } from "../../../../shared/components/confirmation/confirmation.component";
import { PlayerFacade } from "../../facades/player.facade";
import { AuthFacade } from "../../../../shared/security/auth/facades/auth.facade";
import { PseudoPipe } from "../../../../shared/pipes/pseudo.pipe";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [CommonModule, ConfirmationComponent, PseudoPipe, TranslatePipe],
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.css']
})
export class PlayerCardComponent {
  @Input() player!: Player;
  @Output() select = new EventEmitter<Player>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Player>()

  showConfirmation = false;
  playerToDelete: Player | null = null;

  public constructor(
    private playerFacade: PlayerFacade,
    private toastService: ToastService,
    public authFacade: AuthFacade) {
  }

  onEditClick(event: Event): void {
    event.stopPropagation();  // Empêche l'event select de se déclencher
    this.edit.emit(this.player);
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatBirthDate(): string {
    const {dayOfBirth, monthOfBirth, yearOfBirth} = this.player;

    if (!dayOfBirth && !monthOfBirth && !yearOfBirth) {
      return '';
    }

    if (dayOfBirth && monthOfBirth && yearOfBirth) {
      return `${this.padNumber(dayOfBirth)}/${this.padNumber(monthOfBirth)}/${yearOfBirth}`;
    }

    if (dayOfBirth && monthOfBirth) {
      return `${this.padNumber(dayOfBirth)}/${this.padNumber(monthOfBirth)}`;
    }

    return '';
  }

  private padNumber(num?: number): string {
    if (num === undefined) return '';
    return num.toString().padStart(2, '0');
  }

  isExpired(dateString: string | null | undefined): boolean {
    if (!dateString) return false;
    const validDate = new Date(dateString);
    return validDate < new Date();
  }

  generateAvatarColor(name: string): string {
    if (!name) return '#3490dc'; // Couleur par défaut

    // Génère une couleur basée sur les caractères du nom
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f97316', // orange
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#6366f1', // indigo
      '#14b8a6', // teal
    ];

    // Calcule un indice basé sur les caractères du nom
    let total = 0;
    for (let i = 0; i < name.length; i++) {
      total += name.charCodeAt(i);
    }

    // Sélectionne une couleur de notre palette
    return colors[total % colors.length];
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.playerToDelete = this.player;
    this.showConfirmation = true;
  }

// Ajoutez ces méthodes pour gérer la confirmation
  confirmDelete(): void {
    if (this.playerToDelete) {
      this.playerFacade.deletePlayer(this.playerToDelete.uuid)
        .pipe(
          tap(() => {
            this.toastService.success(`Le joueur ${this.playerToDelete?.firstName} ${this.playerToDelete?.lastName} a été supprimé avec succès!`);
            this.playerFacade.loadPlayers();
          }),
          catchError(err => {
            this.toastService.error(`Erreur lors de la suppression du joueur: ${err.message || 'Erreur inconnue'}`);
            return of(null);
          })
        )
        .subscribe(() => {
          this.closeConfirmation();
        });
    } else {
      this.closeConfirmation();
    }
  }

  closeConfirmation(): void {
    this.showConfirmation = false;
    this.playerToDelete = null;
  }
}
