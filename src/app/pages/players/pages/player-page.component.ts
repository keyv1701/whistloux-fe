import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {AsyncPipe, NgIf} from '@angular/common';
import {PlayerFacade} from "../facades/player.facade";
import {Player} from "../../../models/player.interface";
import {finalize, Subject} from "rxjs";
import {PlayerListComponent} from '../components/player-list/player-list.component';
import {PlayerErrorAlertComponent} from '../components/player-error-alert/player-error-alert.component';
import {LoaderComponent} from "../../../shared/components/loader/loader.component";
import {ToastService} from "../../../shared/services/toast.service";

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    NgIf, ReactiveFormsModule, AsyncPipe,
    PlayerListComponent, PlayerErrorAlertComponent, LoaderComponent
  ],
  templateUrl: './player-page.component.html',
})
export class PlayerPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isImporting = false;

  constructor(
    public playerFacade: PlayerFacade,
    private toastService: ToastService
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

  onExportPlayers(): void {
    this.playerFacade.exportPlayersToExcel();
    this.toastService.info('L\'export Excel a été lancé');
  }

  onImportPlayers(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx, .xls';

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.importFile(file);
      }
    };

    fileInput.click();
  }

  private importFile(file: File): void {
    this.isImporting = true;

    this.playerFacade.importPlayersFromExcel(file).pipe(
      finalize(() => this.isImporting = false)
    ).subscribe();
  }
}
