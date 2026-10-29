import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { CategoriaService } from '../../../services/categoria.service';
import { ProductoService } from '../../../services/producto.service';
import { ProductoFormComponent } from './producto-form.component';

describe('ProductoFormComponent', () => {
  let fixture: ComponentFixture<ProductoFormComponent>;
  let confirmar: jasmine.Spy;
  let navegar: jasmine.Spy;
  let crear: jasmine.Spy;

  beforeEach(async () => {
    confirmar = jasmine.createSpy('confirmar').and.returnValue(false);
    spyOn(window, 'confirm').and.callFake(message => confirmar(message));
    navegar = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));
    crear = jasmine.createSpy('crear').and.returnValue(of({ id: 5 }));

    await TestBed.configureTestingModule({
      imports: [ProductoFormComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({})) },
        },
        {
          provide: Router,
          useValue: { navigate: navegar },
        },
        {
          provide: ProductoService,
          useValue: {
            errorOperacion: signal(null),
            obtenerPorId: () => of(null),
            crear,
            actualizar: () => of({}),
          },
        },
        {
          provide: CategoriaService,
          useValue: { obtenerTodas: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoFormComponent);
  });

  it('consulta si se permite salir solo cuando hay cambios pendientes', () => {
    const componente = fixture.componentInstance;
    expect(componente.puedeSalir()).toBeTrue();

    componente.marcarCambios();
    expect(componente.puedeSalir()).toBeFalse();
    expect(confirmar).toHaveBeenCalled();

    confirmar.and.returnValue(true);
    expect(componente.puedeSalir()).toBeTrue();
  });

  it('descarta los cambios explícitamente y navega al listado', () => {
    const componente = fixture.componentInstance;
    componente.marcarCambios();

    componente.descartarCambios();

    expect(componente.cambiosPendientes).toBeFalse();
    expect(componente.puedeSalir()).toBeTrue();
    expect(navegar).toHaveBeenCalledWith(['/admin/productos']);
  });

  it('limpia el estado pendiente al guardar correctamente', () => {
    const componente = fixture.componentInstance;
    componente.titulo = 'Producto nuevo';
    componente.precio = 2500;
    componente.descripcion = 'Descripción de prueba';
    componente.categoriaId = 3;
    componente.imagen = 'https://placehold.co/300x300';
    componente.marcarCambios();

    componente.guardar();

    expect(crear).toHaveBeenCalled();
    expect(componente.cambiosPendientes).toBeFalse();
    expect(componente.puedeSalir()).toBeTrue();
  });
});
