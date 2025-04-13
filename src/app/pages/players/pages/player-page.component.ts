import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { PlayerFacade } from "../facades/player.facade";
import { Player } from "../../../models/players/player.interface";
import { Subject } from "rxjs";
import { PlayerListComponent } from '../components/player-list/player-list.component';
import { PlayerErrorAlertComponent } from '../components/player-error-alert/player-error-alert.component';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { ToastService } from "../../../shared/services/toast.service";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    NgIf, ReactiveFormsModule, AsyncPipe,
    PlayerListComponent, PlayerErrorAlertComponent, LoaderComponent, TranslatePipe
  ],
  templateUrl: './player-page.component.html',
})
export class PlayerPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    public playerFacade: PlayerFacade,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {
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
    if (confirm(this.translateService.instant('confirm.player.delete'))) {
      this.playerFacade.deletePlayer(uuid);
    }
  }

  onCancel(): void {
    this.playerFacade.clearSelectedPlayer();
  }

  onDismissError(): void {
    this.playerFacade.clearError();
  }

  onExportPlayers(): void {
    this.playerFacade.exportPlayersToExcel();
    this.toastService.info(this.translateService.instant('info.excel.exportStarted'));
  }
}
