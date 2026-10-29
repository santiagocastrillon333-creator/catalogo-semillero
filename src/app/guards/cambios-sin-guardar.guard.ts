import { CanDeactivateFn } from '@angular/router';

// Definir el contrato para que una página indique si permite abandonarla.
export interface PuedeSalir {
  puedeSalir(): boolean;
}

// Consultar el contrato del componente antes de completar la navegación.
export const cambiosSinGuardarGuard: CanDeactivateFn<PuedeSalir> = componente =>
  componente.puedeSalir();
