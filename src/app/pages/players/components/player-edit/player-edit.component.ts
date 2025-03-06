import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../../models/player.interface';
import { PlayerFormComponent } from '../player-form/player-form.component';

@Component({
  selector: 'app-player-edit',
  standalone: true,
  imports: [CommonModule, PlayerFormComponent],
  templateUrl: './player-edit.component.html',
  styleUrls: ['./player-edit.component.css']
})
export class PlayerEditComponent {
  @Input() player!: Player;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Player>();

  @Output() edit = new EventEmitter<Player>()

  onClose(): void {
    this.close.emit();
  }

  onPlayerSubmit(updatedPlayer: Player): void {
    this.saved.emit(updatedPlayer);
  }

  onEditClick(event: Event): void {
    event.stopPropagation(); // Empêche la propagation de l'événement
    this.edit.emit(this.player);
  }
}
