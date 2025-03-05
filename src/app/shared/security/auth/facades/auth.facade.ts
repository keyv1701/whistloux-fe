import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AuthState } from "../../../../models/security/auth-state.component";
import { LoginCredentials } from "../../../../models/security/login-credentials.interface";
import { AuthResponse } from "../../../../models/security/auth-response.interface";

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: this.hasToken(),
    user: this.getStoredUser(),
    token: this.getStoredToken(),
    error: null
  });

  authState$ = this.authState.asObservable();
  isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());
  currentUser$ = new BehaviorSubject<any>(this.getStoredUser());
  error$ = new BehaviorSubject<string | null>(null);
  isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {
    this.initAuth();
  }

  private initAuth(): void {
    if (this.hasToken()) {
      this.isLoading$.next(true);

      this.authService.getCurrentUser().pipe(
        tap(user => {
          this.updateAuthState({
            isAuthenticated: true,
            user,
            token: this.getStoredToken(),
            error: null
          });
        }),
        catchError(() => {
          return this.logout();
        }),
        finalize(() => this.isLoading$.next(false))
      ).subscribe();
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoading$.next(true);
    this.error$.next(null);

    // Utiliser la méthode secureLogin qui gère tout le processus
    return this.authService.secureLogin(credentials).pipe(
      switchMap(response => {
        // Stocke d'abord le token d'authentification
        this.storeToken(response.token);

        // Puis effectue un appel à /me pour récupérer les informations utilisateur complètes
        return this.authService.getCurrentUser().pipe(
          map(user => {
            // Combine la réponse et les informations utilisateur
            return {
              ...response,
              user: user
            };
          }),
          catchError(error => {
            console.error('Erreur lors de la récupération des données utilisateur:', error);
            // En cas d'erreur, continue avec les données utilisateur limitées de la réponse d'authentification
            return of(response);
          })
        );
      }),
      tap(response => {
        // Stocke les informations utilisateur complètes
        this.storeUser(response.user);
        this.updateAuthState({
          isAuthenticated: true,
          user: response.user,
          token: response.token,
          error: null
        });
        this.router.navigate(['/']);
      }),
      catchError(error => {
        const errorMsg = error.error?.message || 'Échec de connexion. Vérifiez vos identifiants.';
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
    this.clearStorage();
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

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private storeUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): any | null {
    try {
      const userString = localStorage.getItem(this.USER_KEY);
      if (!userString) {
        return null;
      }
      return JSON.parse(userString);
    } catch (error) {
      console.error('Erreur lors du parsing du user stocké:', error);
      localStorage.removeItem(this.USER_KEY); // Supprime l'entrée corrompue
      return null;
    }
  }

  private hasToken(): boolean {
    return !!this.getStoredToken();
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
