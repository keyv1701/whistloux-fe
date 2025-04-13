import { Injectable } from '@angular/core';
import { AuthService } from '../../../shared/security/auth/services/auth.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from "../../../shared/services/toast.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordFacade {

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.authService.changePassword(currentPassword, newPassword).pipe(
      catchError(error => {
        this.toastService.error(this.translateService.instant('error.changePassword'));
        throw error;
      })
    );
  }
}
