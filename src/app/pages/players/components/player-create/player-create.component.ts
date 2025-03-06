import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../../models/player.interface';
import { PlayerFormComponent } from '../player-form/player-form.component';

@Component({
  selector: 'app-player-create',
  standalone: true,
  imports: [CommonModule, PlayerFormComponent],
  templateUrl: './player-create.component.html',
  styleUrls: ['./player-create.component.css']
})
export class PlayerCreateComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Player>();

  onClose(): void {
    this.close.emit();
  }

  onPlayerSubmit(player: Player): void {
    // Génération d'un UUID temporaire, généralement le backend s'en chargera
    player.uuid = crypto.randomUUID();
    this.saved.emit(player);
  }
}
