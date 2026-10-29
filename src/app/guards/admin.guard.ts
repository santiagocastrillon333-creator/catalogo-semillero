import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Comprobar el rol antes de permitir la coincidencia de la configuración lazy.
export const adminGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado() && authService.tieneRol('admin')) {
    return true;
  }

  // Enviar a usuarios autenticados sin permisos a una ruta pública.
  if (authService.estaAutenticado()) {
    return router.createUrlTree(['/productos']);
  }

  return router.createUrlTree(['/login']);
};
