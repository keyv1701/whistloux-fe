import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TournamentFacade } from "../../facades/tournament.facade";

@Component({
  selector: 'app-tournament-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './tournament-registration.component.html',
  styleUrls: ['./tournament-registration.component.css']
})
export class TournamentRegistrationComponent implements OnInit {
  @Input() tournament: any;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  registrationForm: FormGroup;

  constructor(
    private renderer: Renderer2,
    private fb: FormBuilder,
    private tournamentFacade: TournamentFacade,
    private translateService: TranslateService
  ) {
    this.registrationForm = this.fb.group({
      lastname: [''],
      firstname: [''],
      pseudo: [''],
      email: ['', [Validators.email]],
      phone: [''],
      tournamentUuid: [''],
      message: [this.translateService.instant('tournament.registration.message.prefill')]
    });
  }

  ngOnInit(): void {
    // Désactiver le défilement du corps lorsque la popup est ouverte
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  ngOnDestroy(): void {
    // Réactiver le défilement du corps lorsque la popup est fermée
    this.renderer.setStyle(document.body, 'overflow', 'auto');
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const registrationData = this.registrationForm.value;
      registrationData.tournamentUuid = this.tournament.uuid;
      this.tournamentFacade.sendRegistrationMail(registrationData).subscribe();
      this.submitted.emit(registrationData);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
