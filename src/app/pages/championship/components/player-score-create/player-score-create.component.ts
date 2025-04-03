import { Component, EventEmitter, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { PlayerScoreFormComponent } from "../player-score-form/player-score-form.component";
import { Observable } from "rxjs";
import { PlayerLight } from "../../../../models/players/player-light.interface";
import { PlayerFacade } from "../../../players/facades/player.facade";
import { PseudoPipe } from "../../../../shared/pipes/pseudo.pipe";
import { map } from "rxjs/operators";

@Component({
  standalone: true,
  selector: 'app-player-score-create',
  templateUrl: './player-score-create.component.html',
  imports: [
    PlayerScoreFormComponent,
    PseudoPipe
  ],
  styleUrls: ['./player-score-create.component.css']
})
export class PlayerScoreCreateComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<any>();

  public pseudos$: Observable<PlayerLight[]>;

  constructor(
    private renderer: Renderer2,
    private playerFacade: PlayerFacade
  ) {
    this.pseudos$ = this.playerFacade.loadPlayerPseudos().pipe(
      map(players => players.map(player => ({
        ...player,
        pseudo: new PseudoPipe().transform(player.pseudo)
      })))
    );
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
    this.created.emit(formData);
  }
}
