import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentModel } from '../../../../models/tournament/tournament.model';
import { TimeFormatPipe } from "../../../../shared/pipes/time-format.pipe";
import { TranslatePipe } from "@ngx-translate/core";
import { TournamentRegistrationComponent } from "../tournament-registration/tournament-registration.component";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { NgLetDirective } from "../../../../shared/directives/ng-let.directive";

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [CommonModule, TimeFormatPipe, TranslatePipe, TournamentRegistrationComponent, NgLetDirective],
  templateUrl: './tournament-detail.component.html',
  styleUrls: ['./tournament-detail.component.css']
})
export class TournamentDetailComponent implements OnChanges {
  @Input() tournament: TournamentModel | null = null;

  @ViewChild('mapElement') mapElement!: ElementRef;

  private map: any;
  showRegistrationForm = false;

  mapUrl: SafeResourceUrl | null = null;

  zoom = 15;

  constructor(
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournament']) {
      this.updateMapUrl();
    }
  }

  private updateMapUrl(): void {
    if (this.tournament) {
      if (this.tournament.lat && this.tournament.lng) {
        // Si les coordonnées sont disponibles
        const url = `https://maps.google.com/maps?q=${this.tournament.lat},${this.tournament.lng}&z=${this.zoom}&output=embed&hl=fr`;
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      } else if (this.tournament.address) {
        // Fallback: si l'adresse est disponible mais pas les coordonnées
        const url = `https://maps.google.com/maps?q=${encodeURIComponent(this.tournament.address)}&z=${this.zoom}&output=embed&hl=fr`;
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      } else {
        this.mapUrl = null;
      }
    } else {
      this.mapUrl = null;
    }
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  getPhoneNumbersAndInfo(phoneText: string): { phones: string[], additionalInfo: string } {
    if (!phoneText) return {phones: [], additionalInfo: ''};

    // Recherche des numéros de téléphone dans le texte (formats belges et internationaux)
    const phoneRegex = /(\+?[0-9][0-9\-\/.() ]{7,}[0-9])/g;
    const phones: string[] = [];
    let remainingText = phoneText;
    let lastIndex = 0;

    // Extraire tous les numéros de téléphone
    let match;
    const matches = [...phoneText.matchAll(phoneRegex)];

    if (matches.length > 0) {
      for (match of matches) {
        const phoneNumber = match[1].trim();
        phones.push(phoneNumber);

        // Remplacer le numéro par un marqueur
        remainingText = remainingText.replace(phoneNumber, '###PHONE###');
      }

      // Nettoyer le texte restant
      const additionalInfo = remainingText
        .replace(/###PHONE###/g, '')  // Supprimer les marqueurs
        .replace(/\(\s*\)/g, '')      // Supprimer les parenthèses vides
        .replace(/^[\s,;:\-–—]+|[\s,;:\-–—]+$/g, '') // Supprimer les délimiteurs au début et à la fin
        .replace(/\s+/g, ' ')         // Normaliser les espaces
        .trim();

      return {phones, additionalInfo};
    }

    return {phones: [], additionalInfo: phoneText};
  }

  cleanPhoneNumber(phone: string): string {
    return phone.replace(/[^0-9+]/g, '');
  }

  protected readonly encodeURIComponent = encodeURIComponent;
}
