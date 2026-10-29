import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Comprobar la sesión antes de activar la página protegida.
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  // Conservar la URL solicitada dentro de la transición de navegación.
  return router.createUrlTree(['/login'], {
    queryParams: { volverA: state.url },
  });
};
