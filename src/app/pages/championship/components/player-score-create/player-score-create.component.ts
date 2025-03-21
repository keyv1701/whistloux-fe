import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerScoreFormComponent } from '../player-score-form/player-score-form.component';
import { PlayerFacade } from "../../../players/facades/player.facade";
import { Observable } from "rxjs";
import { PlayerLight } from "../../../../models/players/player-light.interface";

@Component({
  selector: 'app-player-score-create',
  templateUrl: './player-score-create.component.html',
  styleUrls: ['./player-score-create.component.scss'],
  standalone: true,
  imports: [CommonModule, PlayerScoreFormComponent]
})
export class PlayerScoreCreateComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  public pseudos$: Observable<PlayerLight[]>;

  public constructor(
    private playerFacade: PlayerFacade
  ) {
    this.pseudos$ = this.playerFacade.loadPlayerPseudos();
  }

  onFormSubmit(formData: any): void {
    this.saved.emit(formData);
  }
}
