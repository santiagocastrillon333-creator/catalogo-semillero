import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { Producto } from '../../models/Producto';
import { ProductoService } from '../../services/producto.service';
import { DetalleProductoComponent } from './detalle-producto.component';

describe('DetalleProductoComponent', () => {
  let fixture: ComponentFixture<DetalleProductoComponent>;
  let parametros$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let obtenerPorId: jasmine.Spy;
  let obtenerPorCategoria: jasmine.Spy;

  const producto = (id: number, title: string): Producto => ({
    id,
    title,
    price: 1000,
    description: `Descripción ${title}`,
    images: [],
    stock: 3,
    category: { id: 7, name: 'Categoría de prueba' },
  });

  beforeEach(async () => {
    parametros$ = new BehaviorSubject(convertToParamMap({ id: '42' }));
    obtenerPorId = jasmine.createSpy('obtenerPorId');
    obtenerPorCategoria = jasmine.createSpy('obtenerPorCategoria')
      .and.returnValue(of([producto(42, 'Producto 42')]));

    const servicioSimulado = {
      errorCarga: signal<string | null>(null),
      obtenerPorId: (id: number) => obtenerPorId(id),
      obtenerPorCategoria: (id: number) => obtenerPorCategoria(id),
    };

    await TestBed.configureTestingModule({
      imports: [DetalleProductoComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: parametros$.asObservable() },
        },
        { provide: ProductoService, useValue: servicioSimulado },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleProductoComponent);
  });

  it('consulta el identificador nuevo y cancela la respuesta del anterior', () => {
    const respuesta42 = new Subject<Producto>();
    const respuesta43 = new Subject<Producto>();
    obtenerPorId.and.callFake((id: number) =>
      id === 42 ? respuesta42 : respuesta43
    );

    let estadoActual: { producto: Producto | null } | undefined;
    const suscripcion = fixture.componentInstance.detalle$.subscribe(estado => {
      estadoActual = estado;
    });

    parametros$.next(convertToParamMap({ id: '43' }));
    respuesta43.next(producto(43, 'Producto 43'));
    respuesta42.next(producto(42, 'Producto 42'));

    expect(obtenerPorId).toHaveBeenCalledWith(42);
    expect(obtenerPorId).toHaveBeenCalledWith(43);
    expect(estadoActual?.producto?.id).toBe(43);

    suscripcion.unsubscribe();
  });

  it('muestra un mensaje cuando la API responde que el producto no existe', () => {
    obtenerPorId.and.returnValue(
      throwError(() => ({ status: 404 }))
    );

    const resultado: { mensajeError: string | null } = { mensajeError: null };
    const suscripcion = fixture.componentInstance.detalle$.subscribe(estado => {
      resultado.mensajeError = estado.mensajeError;
    });

    expect(resultado.mensajeError).toBe('No se encontró el producto solicitado.');
    suscripcion.unsubscribe();
  });
});
