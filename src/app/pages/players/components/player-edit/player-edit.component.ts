// player-edit.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Player } from '../../../../models/player.interface';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-player-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './player-edit.component.html',
  styleUrls: ['./player-edit.component.css']
})
export class PlayerEditComponent implements OnInit {
  @Input() player!: Player;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Player>();

  playerForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private playerService: PlayerService
  ) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.playerForm = this.fb.group({
      firstName: [this.player.firstName, Validators.required],
      lastName: [this.player.lastName, Validators.required],
      email: [this.player.email, [Validators.required, Validators.email]],
      dayOfBirth: [this.player.dayOfBirth],
      monthOfBirth: [this.player.monthOfBirth],
      yearOfBirth: [this.player.yearOfBirth],
      pay: [this.player.pay],
      validSince: [this.player.validSince ? this.formatDateForInput(this.player.validSince) : ''],
      validUntil: [this.player.validUntil ? this.formatDateForInput(this.player.validUntil) : ''],
      address: [this.player.address, Validators.required],
      gsm: [this.player.gsm],
      phoneNumber: [this.player.phoneNumber]
    });
  }

  formatDateForInput(dateString: string): string {
    // Convertir la date en format YYYY-MM-DD pour les inputs de type date
    return dateString.split('T')[0];
  }

  onSubmit(): void {
    if (this.playerForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const updatedPlayer: Player = {
      ...this.player,
      ...this.playerForm.value,
      validSince: this.playerForm.value.validSince || undefined,
      validUntil: this.playerForm.value.validUntil || null
    };

    this.playerService.updatePlayer(updatedPlayer).subscribe({
      next: (player) => {
        this.isSubmitting = false;
        this.saved.emit(player);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de la sauvegarde: ' + (err.message || 'Erreur inconnue');
      }
    });
  }

  onCancel(): void {
    this.close.emit();
  }
}
