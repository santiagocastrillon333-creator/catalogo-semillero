import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { signal } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { of } from 'rxjs';

import { CatalogoPageComponent } from './catalogo-page.component';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { CarritoService } from '../../services/carrito.service';

describe('CatalogoPageComponent', () => {
  let component: CatalogoPageComponent;
  let fixture: ComponentFixture<CatalogoPageComponent>;
  let routerNavigate: jasmine.Spy;

  beforeEach(async () => {
    registerLocaleData(localeEsCo);
    routerNavigate = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [CatalogoPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({})),
          },
        },
        {
          provide: Router,
          useValue: { navigate: routerNavigate },
        },
        {
          provide: ProductoService,
          useValue: {
            errorCarga: signal(null),
            errorOperacion: signal(null),
            obtenerTodos: () => of([]),
            obtenerPorCategoria: () => of([]),
            crear: () => of({}),
            actualizar: () => of({}),
            eliminar: () => of(true),
          },
        },
        {
          provide: CategoriaService,
          useValue: { obtenerTodas: () => of([]) },
        },
        {
          provide: CarritoService,
          useValue: {
            productos: signal([]).asReadonly(),
            cantidad: signal(0),
            total: signal(0),
            agregar: () => undefined,
            vaciar: () => undefined,
          },
        },
      ],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CatalogoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('actualiza la categoría y reinicia la página en la URL', () => {
    const evento = {
      target: { value: '4' },
    } as unknown as Event;

    component.cambiarCategoria(evento);

    expect(routerNavigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { categoria: 4, pagina: 1 },
      queryParamsHandling: 'merge',
    }));
  });
});
