import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { PlayerScoreFormComponent } from "../player-score-form/player-score-form.component";
import { WhistBidsWeek } from "../../../../models/bids/whist-bids-week.model";

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
  @Input() bids: WhistBidsWeek | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  constructor(private renderer: Renderer2) {
  }


  ngOnInit(): void {
    // Désactiver le défilement du corps lorsque la popup est ouverte
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  ngOnDestroy(): void {
    // Réactiver le défilement du corps lorsque la popup est fermée
    this.renderer.setStyle(document.body, 'overflow', 'auto');
  }

  onFormSubmit(formData: any): void {
    this.saved.emit(formData);
  }
}
