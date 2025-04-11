import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangePasswordFacade } from '../facades/change-password.facade';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { catchError, EMPTY, tap } from "rxjs";
import { ToastService } from "../../../shared/services/toast.service";
import { CommonModule } from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private changePasswordFacade: ChangePasswordFacade,
    private router: Router,
    private toastService: ToastService
  ) {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {validators: this.passwordMatchValidator});
  }

  ngOnInit(): void {
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : {mismatch: true};
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const currentPassword = this.passwordForm.get('currentPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    this.changePasswordFacade.changePassword(currentPassword, newPassword)
      .pipe(
        tap(() => {
          this.toastService.success('Votre mot de passe a été modifié avec succès');
          this.passwordForm.reset();
          this.router.navigate(['/home']);
        }),
        catchError((error) => {
          if (error.error?.message) {
            this.toastService.error(error.error.message);
          } else {
            this.toastService.error('Erreur lors du changement de mot de passe. Veuillez réessayer.');
          }
          return EMPTY;
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe();
  }
}
