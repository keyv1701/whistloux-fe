import { Component, EventEmitter, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { PlayerScoreFormComponent } from "../player-score-form/player-score-form.component";
import { Observable } from "rxjs";
import { PlayerLight } from "../../../../models/players/player-light.interface";
import { PlayerFacade } from "../../../players/facades/player.facade";
import { PseudoPipe } from "../../../../shared/pipes/pseudo.pipe";
import { map } from "rxjs/operators";
import { TranslatePipe } from "@ngx-translate/core";
import { RoundPlayersScoreFormComponent } from "../player-score-round-form/player-score-round-form.component";

@Component({
  standalone: true,
  selector: 'app-player-score-round-create',
  templateUrl: './player-score-round-create.component.html',
  imports: [
    PlayerScoreFormComponent,
    PseudoPipe,
    TranslatePipe,
    RoundPlayersScoreFormComponent
  ],
  styleUrls: ['./player-score-round-create.component.css']
})
export class PlayerScoreRoundCreateComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<any>();

  public pseudos$: Observable<PlayerLight[]>;

  constructor(
    private renderer: Renderer2,
    private playerFacade: PlayerFacade
  ) {
    this.pseudos$ = this.playerFacade.loadActivePlayerPseudos().pipe(
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
