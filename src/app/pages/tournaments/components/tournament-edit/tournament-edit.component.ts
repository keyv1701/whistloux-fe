import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TournamentModel } from '../../../../models/tournament/tournament.model';
import { CommonModule } from '@angular/common';
import { TournamentFormComponent } from "../tournament-form/tournament-form.component";

@Component({
  selector: 'app-tournament-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TournamentFormComponent],
  templateUrl: './tournament-edit.component.html',
  styleUrls: ['./tournament-edit.component.css']
})
export class TournamentEditComponent {
  @Input() tournament: TournamentModel | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<TournamentModel>();

  onSaved(result: TournamentModel) {
    this.saved.emit(result);
  }

  onClose(): void {
    this.close.emit();
  }
}
