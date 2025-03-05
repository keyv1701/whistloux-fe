import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoginCredentials } from "../../../../models/security/login-credentials.interface";
import { AuthResponse } from "../../../../models/security/auth-response.interface";
import { environment } from "../../../../../environments/environment";
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {
  }

  // Phase 1 : Demande de sel pour l'utilisateur
  requestSalt(username: string): Observable<string> {
    return this.http.get<{ salt: string }>(`${this.apiUrl}/salt/${username}`).pipe(
      map(response => response.salt),
      catchError(error => {
        // En cas d'erreur, on utilise un sel par défaut pour ne pas révéler si l'utilisateur existe
        console.error('Erreur lors de la récupération du sel', error);
        return of('default-salt-for-non-existent-users');
      })
    );
  }

  // Phase 2 : Login avec le mot de passe hashé avec le sel spécifique
  login(credentials: LoginCredentials, salt: string): Observable<AuthResponse> {
    const secureCredentials = {
      username: credentials.username,
      password: this.hashPassword(credentials.password, salt)
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, secureCredentials);
  }

  // Procédure complète de login
  secureLogin(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.requestSalt(credentials.username).pipe(
      map(salt => {
        const hashedPassword = this.hashPassword(credentials.password, salt);
        return {
          username: credentials.username,
          password: hashedPassword
        };
      }),
      switchMap(secureCredentials => {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, secureCredentials);
      })
    );
  }

  private hashPassword(password: string, salt: string): string {
    // PBKDF2 avec sel unique par utilisateur
    const iterations = 10000;
    const keySize = 256 / 32;

    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: keySize,
      iterations: iterations
    });

    return key.toString();
  }

  logout(): Observable<any> {
    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem('auth_token');

    // Définir les headers avec le token d'authentification
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    // Envoyer la requête avec les headers et éventuellement un corps si nécessaire
    return this.http.post(`${this.apiUrl}/logout`, {}, httpOptions);
  }

  getCurrentUser(): Observable<any> {
    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem('auth_token');

    // Configurer les headers avec le token d'authentification
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    // Faire l'appel API avec les headers configurés
    return this.http.get<any>(`${this.apiUrl}/me`, httpOptions);
  }
}
