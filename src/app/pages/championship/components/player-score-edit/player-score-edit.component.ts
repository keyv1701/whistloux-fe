import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerScoreFormComponent } from '../player-score-form/player-score-form.component';

@Component({
  selector: 'app-player-score-edit',
  templateUrl: './player-score-edit.component.html',
  styleUrls: ['./player-score-edit.component.scss'],
  standalone: true,
  imports: [CommonModule, PlayerScoreFormComponent]
})
export class PlayerScoreEditComponent {
  @Input() playerScore: any;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  onFormSubmit(formData: any): void {
    this.saved.emit(formData);
  }
}
