import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from "../../../shared/security/auth/facades/auth.facade";
import { catchError, finalize, of } from "rxjs";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authFacade: AuthFacade,
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = null;
      this.isLoading = true;

      this.authFacade.login(this.loginForm.value).pipe(
        catchError(error => {
          this.errorMessage = typeof error === 'string' ? error : 'Échec de connexion. Vérifiez vos identifiants.';
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      ).subscribe();
    }
  }
}
