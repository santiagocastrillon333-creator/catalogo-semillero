import { TestBed } from '@angular/core/testing';
import { Route, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  const ruta = {} as Route;

  it('permite la coincidencia cuando la sesión tiene rol admin', () => {
    const router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            estaAutenticado: () => true,
            tieneRol: () => true,
          },
        },
        { provide: Router, useValue: router },
      ],
    });

    const resultado = TestBed.runInInjectionContext(() => adminGuard(ruta, []));

    expect(resultado).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirige a una ruta pública a una sesión sin rol administrativo', () => {
    const destino = {} as UrlTree;
    const router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue(destino);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            estaAutenticado: () => true,
            tieneRol: () => false,
          },
        },
        { provide: Router, useValue: router },
      ],
    });

    const resultado = TestBed.runInInjectionContext(() => adminGuard(ruta, []));

    expect(resultado).toBe(destino);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/productos']);
  });

  it('redirige a login cuando no existe sesión', () => {
    const destino = {} as UrlTree;
    const router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue(destino);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            estaAutenticado: () => false,
            tieneRol: () => false,
          },
        },
        { provide: Router, useValue: router },
      ],
    });

    expect(TestBed.runInInjectionContext(() => adminGuard(ruta, []))).toBe(destino);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
