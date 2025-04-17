import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { Observable, Subject, Subscription } from "rxjs";
import { PlayerWeekScore } from "../../../../models/championship/player-week-score.model";
import { PlayerLight } from "../../../../models/players/player-light.interface";
import { AutocompleteComponent } from "../../../../shared/components/app-autocomplete/app-autocomplete.component";
import { PlayerWhistFormComponent } from "../../../bids/pages/player-whist-form/player-whist-form.component";
import { WhistBidsWeek } from "../../../../models/bids/whist-bids-week.model";
import { WhistBidDetail } from "../../../../models/bids/whist-bid-detail.model";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-player-score-form',
  standalone: true,
  templateUrl: './player-score-form.component.html',
  imports: [
    ReactiveFormsModule, CommonModule, AutocompleteComponent, PlayerWhistFormComponent, TranslatePipe
  ],
  styleUrls: ['./player-score-form.component.scss']
})
export class PlayerScoreFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() playerScore: any = null;
  @Input() formTitle: string = 'Score du joueur';
  @Input() submitButtonText: string = 'Enregistrer';
  @Input() pseudos$: Observable<PlayerLight[]> | null = null;
  @Input() bids: WhistBidsWeek | null = null;


  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  scoreForm!: FormGroup;
  bidForm!: FormGroup;
  loading = false;

  showDropdown = false;
  private bidsSubscription: Subscription | null = null;


  private searchTerms = new Subject<string>();

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initializeScoreForm(this.playerScore);
    this.initializeBidForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Vérifier si l'input 'bids' a changé
    if (changes['bids'] && changes['bids'].currentValue) {
      this.updateBidFormWithData(changes['bids'].currentValue);
    }
  }

  ngOnDestroy(): void {
    if (this.bidsSubscription) {
      this.bidsSubscription.unsubscribe();
    }
  }

  get hasPlayerDetails(): boolean {
    return !!this.playerScore && !!this.playerScore.playerUuid;
  }

  private initializeScoreForm(playerScore: PlayerWeekScore): void {
    this.scoreForm = this.fb.group({
      round1Points: [this.playerScore?.round1Points],
      round2Points: [this.playerScore?.round2Points],
      round3Points: [this.playerScore?.round3Points],
      playerUuid: [playerScore ? playerScore.playerUuid : null, Validators.required],
      playerPseudoDisplay: [playerScore ? playerScore.playerPseudo : null]
    });
  }

  private initializeBidForm(): void {
    const bidDetailsArray: FormArray = this.fb.array([]);

    this.bidForm = this.fb.group({
      bidDetails: bidDetailsArray
    });
  }

  private updateBidFormWithData(whistBidsWeek: WhistBidsWeek): void {
    if (!whistBidsWeek || !whistBidsWeek.bidDetails || whistBidsWeek.bidDetails.length === 0) {
      return;
    }

    const bidDetailsFA: FormArray = this.fb.array([]);

    whistBidsWeek.bidDetails.forEach(bid => {
      bidDetailsFA.push(this.createBidsDetailFormGroup(bid));
    });

    if (this.bidForm) {
      this.bidForm.setControl('bidDetails', bidDetailsFA);
    } else {
      this.bidForm = this.fb.group({
        bidDetails: bidDetailsFA
      });
    }
  }

  onSelectPlayer(player: PlayerLight): void {
    this.scoreForm.patchValue({
      playerUuid: player.uuid,
      playerPseudoDisplay: player.pseudo
    });
    this.showDropdown = false;
  }

  displayPlayerFn = (player: PlayerLight): string => {
    return player ? player.pseudo : '';
  };

  calculateTotal(): number {
    const round1 = this.scoreForm.get('round1Points')?.value || 0;
    const round2 = this.scoreForm.get('round2Points')?.value || 0;
    const round3 = this.scoreForm.get('round3Points')?.value || 0;
    return Number(round1) + Number(round2) + Number(round3);
  }

  onSubmit(): void {
    if (this.scoreForm.invalid) {
      return;
    }

    const formData = {
      ...this.playerScore,
      round1Points: this.scoreForm.get('round1Points')?.value !== null &&
      this.scoreForm.get('round1Points')?.value !== undefined ?
        Number(this.scoreForm.get('round1Points')?.value) : undefined,
      round2Points: this.scoreForm.get('round2Points')?.value !== null &&
      this.scoreForm.get('round2Points')?.value !== undefined ?
        Number(this.scoreForm.get('round2Points')?.value) : undefined,
      round3Points: this.scoreForm.get('round3Points')?.value !== null &&
      this.scoreForm.get('round3Points')?.value !== undefined ?
        Number(this.scoreForm.get('round3Points')?.value) : undefined,
      total: this.calculateTotal(),
      playerUuid: this.scoreForm.get('playerUuid')?.value,
      playerPseudo: this.scoreForm.get('playerPseudoDisplay')?.value,
      bidDetails: this.bidForm.get('bidDetails')?.value
    };

    this.loading = true;
    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBidDetailsChange(bidDetails: FormArray): void {
  }

  private createBidsDetailFormGroup(detail: WhistBidDetail): FormGroup {
    return this.fb.group({
      bidType: [detail.bidType, Validators.required],
      count: [detail.count, Validators.required],
      success: [detail.success]
    });
  }
}
