import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PuedeSalir, cambiosSinGuardarGuard } from './cambios-sin-guardar.guard';

describe('cambiosSinGuardarGuard', () => {
  const ruta = {} as ActivatedRouteSnapshot;
  const estado = {} as RouterStateSnapshot;

  it('permite salir cuando el componente no tiene cambios pendientes', () => {
    const componente: PuedeSalir = { puedeSalir: () => true };

    expect(cambiosSinGuardarGuard(componente, ruta, estado, estado)).toBeTrue();
  });

  it('cancela la navegación cuando el componente solicita permanecer', () => {
    const componente: PuedeSalir = { puedeSalir: () => false };

    expect(cambiosSinGuardarGuard(componente, ruta, estado, estado)).toBeFalse();
  });
});
