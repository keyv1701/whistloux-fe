import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AuthState } from "../../../../models/security/auth-state.component";
import { LoginCredentials } from "../../../../models/security/login-credentials.interface";
import { AuthResponse } from "../../../../models/security/auth-response.interface";
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    error: null
  });

  authState$ = this.authState.asObservable();
  isAuthenticated$ = new BehaviorSubject<boolean>(false);
  currentUser$ = new BehaviorSubject<any>(null);
  error$ = new BehaviorSubject<string | null>(null);
  isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.initAuth();
  }

  private initAuth(): void {
    this.isLoading$.next(true);

    this.authService.getCurrentUser().pipe(
      tap(user => {
        this.updateAuthState({
          isAuthenticated: true,
          user,
          token: null, // Le token est géré par les cookies
          error: null
        });
      }),
      catchError(() => {
        // L'utilisateur n'est pas authentifié, aucune action nécessaire
        return of(null);
      }),
      finalize(() => this.isLoading$.next(false))
    ).subscribe();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoading$.next(true);
    this.error$.next(null);

    return this.authService.secureLogin(credentials).pipe(
      switchMap(response => {
        return this.authService.getCurrentUser().pipe(
          map(user => {
            return {
              ...response,
              user: user
            };
          }),
          catchError(error => {
            console.error('Erreur lors de la récupération des données utilisateur:', error);
            return of(response);
          })
        );
      }),
      tap(response => {
        this.updateAuthState({
          isAuthenticated: true,
          user: response.user,
          token: null, // Le token est géré par les cookies
          error: null
        });
        this.router.navigate(['/']);
      }),
      catchError(error => {
        const errorMsg = error.error?.message || this.translateService.instant('error.login');
        this.updateAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          error: errorMsg
        });
        throw errorMsg;
      }),
      finalize(() => this.isLoading$.next(false))
    );
  }

  logout(): Observable<any> {
    this.isLoading$.next(true);

    return this.authService.logout().pipe(
      tap(() => this.handleLogoutSuccess()),
      catchError(() => {
        this.handleLogoutSuccess();
        return of(null);
      }),
      finalize(() => this.isLoading$.next(false))
    );
  }

  private handleLogoutSuccess(): void {
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      error: null
    });
    this.router.navigate(['/login']);
  }

  private updateAuthState(state: AuthState): void {
    this.authState.next(state);
    this.isAuthenticated$.next(state.isAuthenticated);
    this.currentUser$.next(state.user);
    this.error$.next(state.error);
  }
}
