import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacade } from '../facades/auth.facade';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return authFacade.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
