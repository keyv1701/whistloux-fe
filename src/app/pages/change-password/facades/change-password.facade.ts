import { Injectable } from '@angular/core';
import { AuthService } from '../../../shared/security/auth/services/auth.service';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordFacade {

  constructor(private authService: AuthService) {
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.authService.changePassword(currentPassword, newPassword).pipe(
      tap(() => {
        // Actions supplémentaires après changement réussi si nécessaire
      }),
      catchError(error => {
        console.error('Erreur lors du changement de mot de passe', error);
        throw error;
      })
    );
  }
}
