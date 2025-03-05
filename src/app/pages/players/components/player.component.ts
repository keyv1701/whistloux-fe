import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { PlayerFacade } from "../facades/player.facade";
import { Player } from "../../../models/player.interface";
import { Subject } from "rxjs";
import { PlayerFormComponent } from './player-form/player-form.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { PlayerErrorAlertComponent } from './player-error-alert/player-error-alert.component';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, ReactiveFormsModule, AsyncPipe,
    PlayerFormComponent, PlayerListComponent, PlayerErrorAlertComponent, LoaderComponent
  ],
  templateUrl: './player.component.html',
})
export class PlayerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(public playerFacade: PlayerFacade) {
  }

  ngOnInit(): void {
    this.playerFacade.loadPlayers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSavePlayer(player: Player): void {
    if (player.uuid) {
      this.playerFacade.updatePlayer(player);
    } else {
      this.playerFacade.createPlayer(player);
    }
    this.playerFacade.clearSelectedPlayer();
  }

  onSelectPlayer(player: Player): void {
    this.playerFacade.loadPlayerByUuid(player.uuid);
  }

  onDeletePlayer(uuid: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur?')) {
      this.playerFacade.deletePlayer(uuid);
    }
  }

  onCancel(): void {
    this.playerFacade.clearSelectedPlayer();
  }

  onDismissError(): void {
    this.playerFacade.clearError();
  }
}
