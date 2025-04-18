import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from "@angular/common";
import { Observable, Subscription } from "rxjs";
import { PlayerLight } from "../../../../models/players/player-light.interface";
import { AutocompleteComponent } from "../../../../shared/components/app-autocomplete/app-autocomplete.component";
import { PlayerWhistFormComponent } from "../../../bids/pages/player-whist-form/player-whist-form.component";
import { WhistBidDetail } from "../../../../models/bids/whist-bid-detail.model";
import { TranslatePipe } from "@ngx-translate/core";
import { PlayerWeekScoreRound } from "../../../../models/championship/player-week-score-round.model";
import { PlayerWeekScoreRoundItem } from "../../../../models/championship/player-week-score-round-item.model";

@Component({
  selector: 'app-player-score-round-form',
  standalone: true,
  templateUrl: './player-score-round-form.component.html',
  imports: [
    ReactiveFormsModule, CommonModule, AutocompleteComponent, PlayerWhistFormComponent, TranslatePipe
  ],
  styleUrls: ['./player-score-round-form.component.css']
})
export class RoundPlayersScoreFormComponent implements OnInit, OnDestroy {
  @Input() roundScore: PlayerWeekScoreRound | null = null;
  @Input() formTitle: string = 'Scores du round';
  @Input() submitButtonText: string = 'Enregistrer';
  @Input() pseudos$: Observable<PlayerLight[]> | null = null;

  @Output() formSubmit = new EventEmitter<PlayerWeekScoreRound>();
  @Output() cancel = new EventEmitter<void>();

  mainForm!: FormGroup;
  bidForms: { [playerIndex: number]: FormGroup } = {};
  loading = false;
  activePlayerIndex: number = 0;

  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeForm(): void {
    this.mainForm = this.fb.group({
      round: [this.roundScore?.round || 1, [Validators.required, Validators.min(1), Validators.max(3)]],
      players: this.fb.array([])
    });

    // Ajouter un joueur initial si aucun score de round n'est fourni
    if (!this.roundScore?.playerWeekScoreRoundItems?.length) {
      this.addPlayer();
    } else {
      this.roundScore.playerWeekScoreRoundItems.forEach(item => {
        this.addPlayer(item);
      });
    }
  }

  get playersFormArray(): FormArray {
    return this.mainForm.get('players') as FormArray;
  }

  addPlayer(playerItem?: PlayerWeekScoreRoundItem): void {
    const playerForm = this.fb.group({
      playerUuid: [playerItem?.playerUuid || null, Validators.required],
      playerPseudo: [null],
      roundPoints: [playerItem?.roundPoints || null],
      hasBidDetails: [!!playerItem?.bidDetails?.length]
    });

    const playerIndex = this.playersFormArray.length;
    this.playersFormArray.push(playerForm);

    // Initialiser un form pour les enchères de ce joueur
    this.initializeBidForm(playerIndex, playerItem?.bidDetails || []);

    // Activer ce joueur
    this.activePlayerIndex = playerIndex;
  }

  removePlayer(index: number): void {
    this.playersFormArray.removeAt(index);
    delete this.bidForms[index];

    // Si on supprime le joueur actif, on active le premier ou on reste au dernier
    if (this.activePlayerIndex === index) {
      this.activePlayerIndex = Math.min(0, this.playersFormArray.length - 1);
    } else if (this.activePlayerIndex > index) {
      // Ajuster l'index actif si on supprime un joueur avant
      this.activePlayerIndex--;
    }
  }

  private initializeBidForm(playerIndex: number, bidDetails: WhistBidDetail[]): void {
    const bidDetailsArray: FormArray = this.fb.array([]);

    if (bidDetails.length) {
      bidDetails.forEach(bid => {
        bidDetailsArray.push(this.createBidDetailFormGroup(bid));
      });
    }

    this.bidForms[playerIndex] = this.fb.group({
      bidDetails: bidDetailsArray
    });
  }

  private createBidDetailFormGroup(detail: WhistBidDetail): FormGroup {
    return this.fb.group({
      bidType: [detail.bidType, Validators.required],
      count: [detail.count, Validators.required],
      success: [detail.success]
    });
  }

  onSelectPlayer(player: PlayerLight, index: number): void {
    const playerForm = this.playersFormArray.at(index);
    playerForm.patchValue({
      playerUuid: player.uuid,
      playerPseudo: player.pseudo
    });
  }

  displayPlayerFn = (player: PlayerLight): string => {
    return player ? player.pseudo : '';
  };

  setActivePlayer(index: number): void {
    this.activePlayerIndex = index;
  }

  onBidDetailsChange(bidDetails: FormArray, playerIndex: number): void {
    // Cette méthode est appelée quand les enchères d'un joueur sont modifiées
  }

  toggleBidDetails(playerIndex: number): void {
    const playerForm = this.playersFormArray.at(playerIndex);
    const hasBidDetails = !playerForm.get('hasBidDetails')?.value;
    playerForm.patchValue({hasBidDetails});
  }

  onSubmit(): void {
    if (this.mainForm.invalid) {
      return;
    }

    this.loading = true;

    const roundItems: PlayerWeekScoreRoundItem[] = this.playersFormArray.controls.map((control, index) => {
      const playerForm = control as FormGroup;
      const bidDetailsValue = playerForm.get('hasBidDetails')?.value ?
        this.bidForms[index].get('bidDetails')?.value || [] : [];

      return {
        playerUuid: playerForm.get('playerUuid')?.value,
        roundPoints: playerForm.get('roundPoints')?.value !== null ?
          Number(playerForm.get('roundPoints')?.value) : null,
        bidDetails: bidDetailsValue
      };
    });

    const formData: PlayerWeekScoreRound = {
      round: this.mainForm.get('round')?.value,
      playerWeekScoreRoundItems: roundItems
    };

    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  canAddMorePlayers(): boolean {
    return this.playersFormArray.length < 5;
  }

  getControlValue(control: AbstractControl, name: string): any {
    return control.get(name)?.value;
  }

  getControlInvalid(control: AbstractControl, name: string): boolean {
    return control.get(name)?.invalid || false;
  }

  getControlTouched(control: AbstractControl, name: string): boolean {
    return control.get(name)?.touched || false;
  }

  getFormControl(control: AbstractControl, name: string): FormControl {
    return control.get(name) as FormControl;
  }
}
