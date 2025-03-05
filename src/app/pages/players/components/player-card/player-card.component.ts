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

  deleteClick(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.player.uuid);
  }
}
