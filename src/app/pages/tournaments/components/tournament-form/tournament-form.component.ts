import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TournamentModel } from '../../../../models/tournament/tournament.model';
import { CommonModule } from '@angular/common';
import { TournamentFacade } from "../../facades/tournament.facade";
import { catchError, debounceTime, distinctUntilChanged, of, Subject } from "rxjs";
import { ToastService } from "../../../../shared/services/toast.service";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { map, switchMap, take } from "rxjs/operators";
import { HttpClient } from '@angular/common/http';

interface NominatimResponse {
  display_name: string;
  lat: string;
  lon: string;
}

@Component({
  selector: 'app-tournament-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './tournament-form.component.html',
  styleUrls: ['./tournament-form.component.css']
})
export class TournamentFormComponent implements OnInit {
  @Input() tournament: TournamentModel | null = null;
  @Input() isEditMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<TournamentModel>();
  @ViewChild('addressInput') addressInput!: ElementRef;

  tournamentForm: FormGroup;
  selectedAddress: string = '';
  suggestions: NominatimResponse[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private tournamentFacade: TournamentFacade,
    private toastService: ToastService,
    private translateService: TranslateService,
    private http: HttpClient
  ) {
    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      address: ['', Validators.required],
      parking: [''],
      date: ['', Validators.required],
      startTime: [''],
      endTime: [''],
      registrationsCount: [0],
      maxPlayers: [0, [Validators.required, Validators.min(0)]],
      registrationOpen: [true],
      registrationDeadline: [''],
      entryFee: [0],
      includedItems: [''],
      prizes: [''],
      contactEmail: ['', Validators.email],
      contactPhone: [''],
      status: ['PLANNED'],
      lat: [null],
      lng: [null]
    });

    // Configuration de la recherche avec debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.getAddressSuggestions(term))
    ).subscribe(results => {
      this.suggestions = results;
    });
  }

  ngOnInit(): void {
    if (this.tournament) {
      // Formater les dates pour les champs input
      const tournament = {...this.tournament};

      if (tournament.startTime) {
        tournament.startTime = tournament.startTime;
      }

      if (tournament.registrationDeadline) {
        const deadlineDate = new Date(tournament.registrationDeadline);
        tournament.registrationDeadline = deadlineDate;
      }

      this.tournamentForm.patchValue(tournament);
      if (tournament.address) {
        this.selectedAddress = tournament.address;
      }
    }
  }

  searchAddress(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value.length > 3) {
      this.searchSubject.next(value);
    } else {
      this.suggestions = [];
    }
  }

  selectAddress(suggestion: NominatimResponse): void {
    this.selectedAddress = suggestion.display_name;
    this.tournamentForm.patchValue({
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    });
    this.suggestions = [];
  }

  private getAddressSuggestions(query: string) {
    if (!query || query.length < 3) {
      return of([]);
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
    return this.http.get<NominatimResponse[]>(url).pipe(
      catchError(() => of([]))
    );
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      const formValues = {...this.tournamentForm.value};
      const savedTournament = this.createSavedTournament(formValues);

      savedTournament.startTime = formValues.startTime;

      if (formValues.registrationDeadline) {
        savedTournament.registrationDeadline = new Date(formValues.registrationDeadline);
      }

      // Ajouter les coordonnées géographiques
      if (formValues.lat && formValues.lng) {
        savedTournament.lat = formValues.lat;
        savedTournament.lng = formValues.lng;
      }

      this.toastService.info(this.translateService.instant('info.tournament.save', {name: savedTournament.name}));
      this.saveAction(savedTournament);
    }
  }

  // Le reste du code reste identique
  private createSavedTournament(formValues: any): TournamentModel {
    if (this.tournament) {
      return {
        ...this.tournament,
        name: formValues.name,
        address: formValues.address,
        parking: formValues.parking,
        registrationsCount: formValues.registrationsCount,
        maxPlayers: formValues.maxPlayers,
        entryFee: formValues.entryFee,
        description: formValues.description,
        prizes: formValues.prizes,
        lat: formValues.lat,
        lng: formValues.lng
      };
    } else {
      return {
        uuid: '',
        name: formValues.name,
        description: formValues.description,
        address: formValues.address,
        parking: formValues.parking,
        date: formValues.date,
        startTime: formValues.startTime || '',
        maxPlayers: formValues.maxPlayers,
        registrationOpen: formValues.registrationOpen,
        registrationDeadline: formValues.registrationDeadline,
        registrationsCount: 0,
        entryFee: formValues.entryFee,
        includedItems: formValues.includedItems,
        prizes: formValues.prizes,
        contactEmail: formValues.contactEmail,
        contactPhone: formValues.contactPhone,
        status: formValues.status,
        lat: formValues.lat,
        lng: formValues.lng
      };
    }
  }

  private saveAction(updatedTournament: TournamentModel) {
    this.isEditMode ? this.updateForm(updatedTournament) : this.createForm(updatedTournament);
  }

  private updateForm(updatedTournament: TournamentModel) {
    this.tournamentFacade.updateTournament(updatedTournament)
      .pipe(
        map(result => {
          this.toastService.success(this.translateService.instant('success.tournament.update', {name: result.name}));
          this.saved.emit(result);
          this.close.emit();
          return result;
        }),
        catchError(err => {
          this.toastService.error(this.translateService.instant('error.tournament.update',
            {error: err.message || 'Erreur inconnue'}));
          return of(null);
        }),
        take(1)
      )
      .subscribe();
  }

  private createForm(updatedTournament: TournamentModel) {
    this.tournamentFacade.createTournament(updatedTournament)
      .pipe(
        map(result => {
          this.toastService.success(this.translateService.instant('success.tournament.create', {name: result.name}));
          this.saved.emit(result);
          this.close.emit();
          return result;
        }),
        catchError(err => {
          this.toastService.error(this.translateService.instant('error.tournament.create',
            {error: err.message || 'Erreur inconnue'}));
          return of(null);
        }),
        take(1)
      )
      .subscribe();
  }

  onClose(): void {
    this.close.emit();
  }
}
