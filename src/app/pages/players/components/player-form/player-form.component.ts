import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Player } from '../../../../models/player.interface';

@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './player-form.component.html'
})
export class PlayerFormComponent implements OnChanges {
  @Input() player: Player | null | undefined = null;
  @Output() save = new EventEmitter<Player>();
  @Output() cancel = new EventEmitter<void>();

  playerForm: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder) {
    this.playerForm = this.fb.group({
      uuid: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['player'] && changes['player'].currentValue) {
      this.playerForm.patchValue(changes['player'].currentValue);
      this.isEditing = true;
    } else if (changes['player'] && !changes['player'].currentValue) {
      this.resetForm();
    }
  }

  onSubmit(): void {
    if (this.playerForm.valid) {
      this.save.emit(this.playerForm.value);
    }
  }

  resetForm(): void {
    this.playerForm.reset();
    this.isEditing = false;
    this.cancel.emit();
  }
}
