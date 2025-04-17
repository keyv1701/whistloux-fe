import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tournament } from '../../../../models/tournament/tournament';
import { TimeFormatPipe } from "../../../../shared/pipes/time-format.pipe";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { ToastService } from "../../../../shared/services/toast.service";
import { TournamentRegistrationComponent } from "../tournament-registration/tournament-registration.component";

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [CommonModule, TimeFormatPipe, TranslatePipe, TournamentRegistrationComponent],
  templateUrl: './tournament-detail.component.html',
  styleUrls: ['./tournament-detail.component.css']
})
export class TournamentDetailComponent implements OnInit {
  @Input() tournament: Tournament | null = null;

  showRegistrationForm = false;

  constructor(
    private toastService: ToastService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(time: string | null | undefined): string {
    if (!time) return '';
    return time;
  }

  isRegistrationAvailable(): boolean {
    if (!this.tournament) return false;

    // Vérifier si les inscriptions sont ouvertes
    const today = new Date();

    // Si aucune deadline n'est définie OU si la deadline est dans le futur
    const deadline = this.tournament.registrationDeadline ? new Date(this.tournament.registrationDeadline) : null;
    const isDeadlineValid = !deadline || today <= deadline;

    // Vérifier si le nombre maximum de joueurs n'est pas atteint
    const hasAvailableSpots = !this.tournament.maxPlayers || this.tournament.registrationsCount < this.tournament.maxPlayers;

    // Les inscriptions sont possibles si la deadline est valide ET qu'il reste des places
    return isDeadlineValid && hasAvailableSpots;
  }

  getAvailableSpotsText(): string {
    if (!this.tournament || !this.tournament.maxPlayers) return '';

    const availableSpots = this.tournament.maxPlayers - this.tournament.registrationsCount;
    if (availableSpots <= 0) return 'Complet';

    return `${availableSpots} place${availableSpots > 1 ? 's' : ''} disponible${availableSpots > 1 ? 's' : ''}`;
  }

  openRegistrationForm(): void {
    this.showRegistrationForm = true;
  }

  onRegistrationFormClose(): void {
    this.showRegistrationForm = false;
  }

  onRegistrationSubmitted(formData: any): void {
    this.showRegistrationForm = false;
  }
}
