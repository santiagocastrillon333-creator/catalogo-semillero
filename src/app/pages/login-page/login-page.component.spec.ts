import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let iniciarSesion: jasmine.Spy;
  let navigateByUrl: jasmine.Spy;
  let volverA: string | null;

  beforeEach(async () => {
    iniciarSesion = jasmine.createSpy('iniciarSesion').and.returnValue(true);
    navigateByUrl = jasmine.createSpy('navigateByUrl').and.returnValue(Promise.resolve(true));
    volverA = '/carrito';

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: { iniciarSesion },
        },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of({ get: () => volverA }) },
        },
        {
          provide: Router,
          useValue: {
            events: of(),
            navigateByUrl,
            createUrlTree: () => ({}),
            serializeUrl: () => '/productos',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
  });

  it('regresa a una ruta interna permitida después del login', () => {
    fixture.componentInstance.usuario = 'ana';
    fixture.componentInstance.clave = 'wposs123';

    fixture.componentInstance.iniciarSesion();

    expect(iniciarSesion).toHaveBeenCalledWith('ana', 'wposs123');
    expect(navigateByUrl).toHaveBeenCalledWith('/carrito');
  });

  it('rechaza un destino externo y utiliza el catálogo como ruta predeterminada', () => {
    volverA = 'https://sitio-externo.example';
    fixture.componentInstance.usuario = 'ana';
    fixture.componentInstance.clave = 'wposs123';

    fixture.componentInstance.iniciarSesion();

    expect(navigateByUrl).toHaveBeenCalledWith('/productos');
  });

  it('muestra un mensaje cuando la autenticación falla', () => {
    iniciarSesion.and.returnValue(false);
    fixture.componentInstance.usuario = 'ana';
    fixture.componentInstance.clave = 'incorrecta';

    fixture.componentInstance.iniciarSesion();

    expect(fixture.componentInstance.mensajeError).toBe('Usuario o contraseña incorrectos.');
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
