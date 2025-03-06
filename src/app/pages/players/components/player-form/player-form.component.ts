import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Player } from '../../../../models/player.interface';

@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './player-form.component.html',
  styleUrls: ['./player-form.component.css']
})
export class PlayerFormComponent implements OnChanges {
  @Input() player: Player | null = null;
  @Output() formSubmit = new EventEmitter<Player>();
  @Output() formCancel = new EventEmitter<void>();

  playerForm: FormGroup;
  isEditing = false;
  months = Array.from({length: 12}, (_, i) => i + 1);
  days = Array.from({length: 31}, (_, i) => i + 1);
  years = this.generateYears();

  constructor(private fb: FormBuilder) {
    this.playerForm = this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['player'] && changes['player'].currentValue) {
      this.isEditing = true;
      this.playerForm.patchValue(this.player as Player);
    } else {
      this.isEditing = false;
      this.playerForm.reset();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      uuid: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      dayOfBirth: [null],
      monthOfBirth: [null],
      yearOfBirth: [null],
      pay: [null],
      validSince: [null],
      validUntil: [null],
      address: [''],
      gsm: [''],
      phoneNumber: ['']
    });
  }

  onSubmit(): void {
    if (this.playerForm.valid) {
      const formValue = this.playerForm.value;
      this.formSubmit.emit(formValue);
    } else {
      this.markFormGroupTouched(this.playerForm);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  private generateYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 80; i <= currentYear; i++) {
      years.push(i);
    }
    return years;
  }

  get isNewPlayer(): boolean {
    return !this.isEditing;
  }
}
