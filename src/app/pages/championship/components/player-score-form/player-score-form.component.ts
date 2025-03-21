import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { Observable, Subject } from "rxjs";
import { PlayerWeekScore } from "../../../../models/championship/player-week-score.model";
import { PlayerLight } from "../../../../models/players/player-light.interface";
import { AutocompleteComponent } from "../../../../shared/components/app-autocomplete/app-autocomplete.component";

@Component({
  selector: 'app-player-score-form',
  standalone: true,
  templateUrl: './player-score-form.component.html',
  imports: [
    ReactiveFormsModule, CommonModule, AutocompleteComponent
  ],
  styleUrls: ['./player-score-form.component.scss']
})
export class PlayerScoreFormComponent implements OnInit {
  @Input() playerScore: any = null;
  @Input() formTitle: string = 'Score du joueur';
  @Input() submitButtonText: string = 'Enregistrer';
  @Input() pseudos$: Observable<PlayerLight[]> | null = null;

  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  scoreForm!: FormGroup;
  loading = false;

  showDropdown = false;

  private searchTerms = new Subject<string>();


  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm(this.playerScore);
  }

  private initForm(playerScore: PlayerWeekScore): void {
    this.scoreForm = this.fb.group({
      round1Points: [this.playerScore?.round1Points || 0, [Validators.required, Validators.min(0)]],
      round2Points: [this.playerScore?.round2Points || 0, [Validators.required, Validators.min(0)]],
      round3Points: [this.playerScore?.round3Points || 0, [Validators.required, Validators.min(0)]],
      playerUuid: [playerScore ? playerScore.playerUuid : null, Validators.required],
      playerPseudoDisplay: ['']
    });
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
      round1Points: Number(this.scoreForm.get('round1Points')?.value),
      round2Points: Number(this.scoreForm.get('round2Points')?.value),
      round3Points: Number(this.scoreForm.get('round3Points')?.value),
      total: this.calculateTotal(),
      playerUuid: this.scoreForm.get('playerUuid')?.value,
      playerPseudo: this.scoreForm.get('playerPseudoDisplay')?.value,
    };

    this.loading = true;
    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
