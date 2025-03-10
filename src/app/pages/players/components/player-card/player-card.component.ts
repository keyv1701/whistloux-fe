import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../../models/player.interface';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.css']
})
export class PlayerCardComponent {
  @Input() player!: Player;
  @Output() select = new EventEmitter<Player>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Player>()

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

}
