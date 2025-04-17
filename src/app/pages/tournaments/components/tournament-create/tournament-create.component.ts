import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TournamentModel } from '../../../../models/tournament/tournament.model';
import { CommonModule } from '@angular/common';
import { TournamentFormComponent } from "../tournament-form/tournament-form.component";

@Component({
  selector: 'app-tournament-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TournamentFormComponent],
  templateUrl: './tournament-create.component.html',
  styleUrls: ['./tournament-create.component.css']
})
export class TournamentCreateComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<TournamentModel>();

  onSaved(result: TournamentModel) {
    this.saved.emit(result);
  }

  onClose(): void {
    this.close.emit();
  }
}
