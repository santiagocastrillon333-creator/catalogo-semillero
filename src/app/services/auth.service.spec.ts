import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const claveSesion = 'catalogo_semillero_sesion';

  beforeEach(() => {
    localStorage.removeItem(claveSesion);
    TestBed.configureTestingModule({ providers: [AuthService] });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.removeItem(claveSesion));

  it('rechaza una clave incorrecta y no crea una sesión', () => {
    expect(service.iniciarSesion('ana', 'incorrecta')).toBeFalse();
    expect(service.estaAutenticado()).toBeFalse();
    expect(localStorage.getItem(claveSesion)).toBeNull();
  });

  it('persiste usuario y rol sin almacenar la contraseña', () => {
    expect(service.iniciarSesion('admin', 'wposs123')).toBeTrue();
    expect(service.estaAutenticado()).toBeTrue();
    expect(service.tieneRol('admin')).toBeTrue();

    const sesion = localStorage.getItem(claveSesion) ?? '';
    expect(sesion).toContain('"nombre":"admin"');
    expect(sesion).toContain('"rol":"admin"');
    expect(sesion).not.toContain('wposs123');
  });

  it('restaura una sesión válida persistida al crear el servicio', () => {
    localStorage.setItem(claveSesion, JSON.stringify({ nombre: 'ana', rol: 'usuario' }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [AuthService] });

    const servicioRestaurado = TestBed.inject(AuthService);

    expect(servicioRestaurado.estaAutenticado()).toBeTrue();
    expect(servicioRestaurado.usuarioActual()).toEqual({
      nombre: 'ana',
      rol: 'usuario',
    });
  });

  it('asigna el rol usuario y elimina el estado al cerrar sesión', () => {
    service.iniciarSesion('camila', 'wposs123');
    expect(service.tieneRol('usuario')).toBeTrue();

    service.cerrarSesion();

    expect(service.estaAutenticado()).toBeFalse();
    expect(localStorage.getItem(claveSesion)).toBeNull();
  });
});
