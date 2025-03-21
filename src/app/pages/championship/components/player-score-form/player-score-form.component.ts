import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-player-score-form',
  standalone: true,
  templateUrl: './player-score-form.component.html',
  imports: [
    ReactiveFormsModule, CommonModule
  ],
  styleUrls: ['./player-score-form.component.scss']
})
export class PlayerScoreFormComponent implements OnInit {
  @Input() playerScore: any = null;
  @Input() formTitle: string = 'Score du joueur';
  @Input() submitButtonText: string = 'Enregistrer';

  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  scoreForm!: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.scoreForm = this.fb.group({
      round1Points: [this.playerScore?.round1Points || 0, [Validators.required, Validators.min(0)]],
      round2Points: [this.playerScore?.round2Points || 0, [Validators.required, Validators.min(0)]],
      round3Points: [this.playerScore?.round3Points || 0, [Validators.required, Validators.min(0)]]
    });
  }

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
      total: this.calculateTotal()
    };

    this.loading = true;
    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
