// src/app/shared/security/auth/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Ajouter withCredentials seulement pour les requêtes vers notre API
  if (req.url.startsWith(environment.apiBaseUrl)) {
    const authReq = req.clone({
      withCredentials: true
    });
    return next(authReq);
  }
  return next(req);
};
