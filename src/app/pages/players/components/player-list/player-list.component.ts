import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../../models/player.interface';
import { PlayerCardComponent } from '../player-card/player-card.component';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, PlayerCardComponent],
  templateUrl: './player-list.component.html'
})
export class PlayerListComponent {
  @Input() players: Player[] | null = [];
  @Output() selectPlayer = new EventEmitter<Player>();
  @Output() deletePlayer = new EventEmitter<string>();
}
