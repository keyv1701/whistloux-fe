// player-score-edit.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlayerScoreFormComponent } from "../player-score-form/player-score-form.component";

@Component({
  standalone: true,
  selector: 'app-player-score-edit',
  templateUrl: './player-score-edit.component.html',
  imports: [
    PlayerScoreFormComponent
  ],
  styleUrls: ['./player-score-edit.component.css']
})
export class PlayerScoreEditComponent implements OnInit {
  @Input() playerScore: any;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit(): void {
    // Désactiver le défilement du corps lorsque la popup est ouverte
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // Réactiver le défilement du corps lorsque la popup est fermée
    document.body.style.overflow = 'auto';
  }

  onFormSubmit(formData: any): void {
    this.saved.emit(formData);
  }

  // Fermer la popup si l'utilisateur clique à l'extérieur (optionnel)
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.close.emit();
    }
  }
}
