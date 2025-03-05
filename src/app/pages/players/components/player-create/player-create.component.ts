import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Player } from '../../../../models/player.interface';

@Component({
  selector: 'app-player-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './player-create.component.html',
  styleUrls: ['./player-create.component.css']
})
export class PlayerCreateComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Player>();

  // Le reste du code est similaire à player-edit mais avec un modèle vide initial
  // Vous pouvez réutiliser la même logique de formulaire que dans player-edit

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    // Logic to validate and emit the new player
    // this.saved.emit(newPlayer);
  }
}
