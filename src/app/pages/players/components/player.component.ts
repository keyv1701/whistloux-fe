import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { PlayerFacade } from "../facades/player.facade";
import { Player } from "../../../models/player.interface";
import { distinctUntilChanged, Subject, takeUntil, tap } from "rxjs";

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ReactiveFormsModule, AsyncPipe],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit, OnDestroy {
  playerForm: FormGroup;
  isEditing = false;
  private destroy$ = new Subject<void>();


  constructor(
    private fb: FormBuilder,
    public playerFacade: PlayerFacade
  ) {
    this.playerForm = this.fb.group({
      uuid: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.playerFacade.loadPlayers();

    this.playerFacade.selectedPlayer$.pipe(
      // Ne réagit qu'aux changements de valeur réels
      distinctUntilChanged((prev, curr) => {
        if (!prev && !curr) return true;
        if (!prev || !curr) return false;
        return prev.uuid === curr.uuid;
      }),
      // Gestion différente selon la présence d'un joueur ou non
      tap(player => {
        if (player) {
          this.playerForm.patchValue(player);
          this.isEditing = true;
        } else {
          // Évite de rappeler resetForm() si on a déjà undefined
          if (this.isEditing) {
            this.playerForm.reset();
            this.isEditing = false;
          }
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.playerForm.valid) {
      const player: Player = this.playerForm.value;

      if (this.isEditing) {
        this.playerFacade.updatePlayer(player);
      } else {
        this.playerFacade.createPlayer(player);
      }

      this.resetForm();
    }
  }

  selectPlayer(player: Player): void {
    this.playerFacade.loadPlayerByUuid(player.uuid);
  }

  deletePlayer(uuid: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur?')) {
      this.playerFacade.deletePlayer(uuid);
    }
  }

  resetForm(): void {
    this.playerForm.reset();
    this.isEditing = false;
    this.playerFacade.clearSelectedPlayer();
  }

  dismissError(): void {
    this.playerFacade.clearError();
  }
}
