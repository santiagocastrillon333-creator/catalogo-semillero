import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  it('devuelve una UrlTree de login con la URL solicitada', () => {
    const urlTree = {} as UrlTree;
    const router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue(urlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { estaAutenticado: () => false } },
        { provide: Router, useValue: router },
      ],
    });

    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/carrito?desde=menu' } as RouterStateSnapshot)
    );

    expect(resultado).toBe(urlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { volverA: '/carrito?desde=menu' },
    });
  });

  it('permite activar la ruta cuando existe una sesión', () => {
    const router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { estaAutenticado: () => true } },
        { provide: Router, useValue: router },
      ],
    });

    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/carrito' } as RouterStateSnapshot)
    );

    expect(resultado).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });
});
