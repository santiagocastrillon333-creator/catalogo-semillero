import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';

import {
  Observable,
  Subject,
  combineLatest,
  catchError,
  concatMap,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap
} from 'rxjs';

import { Producto } from '../../models/Producto';
import { Categoria } from '../../models/Categoria';

import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { CarritoService } from '../../services/carrito.service';

import { TarjetaProductoComponent } from
  '../../components/tarjeta-producto/tarjeta-producto.component';

import { TablaProductosComponent } from
  '../../components/tabla-productos/tabla-productos.component';

// Define los tres tipos de operaciones que puede solicitar el administrador.
type SolicitudOperacion =
  | {
      tipo: 'crear';
      datos: Partial<Producto> & { categoryId: number };
    }
  | {
      tipo: 'actualizar';
      id: number;
      cambios: Partial<Producto>;
    }
  | {
      tipo: 'eliminar';
      id: number;
      titulo: string;
    };

// Define los mensajes que se mostrarán en pantalla.
interface ResultadoOperacion {
  tipo: 'exito' | 'error';
  mensaje: string;
}

@Component({
  selector: 'app-catalogo-page',
  standalone: true,
  imports: [
    CommonModule,
    TarjetaProductoComponent,
    TablaProductosComponent
  ],
  templateUrl: './catalogo-page.component.html',
  styleUrls: ['./catalogo-page.component.css']
})
export class CatalogoPageComponent {

  // ------------------------------------
  // SERVICIOS
  // ------------------------------------

  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly carritoService = inject(CarritoService);

  // Signal de error del servicio de productos.
  readonly errorCatalogo = this.productoService.errorCarga;


  // ------------------------------------
  // CARRITO COMPARTIDO
  // ------------------------------------

  // Los componentes pueden leer el carrito, pero lo modifica el servicio.
  readonly carrito = this.carritoService.productos;

  // Cantidad y total calculados por CarritoService.
  readonly cantidadItemsCarrito = this.carritoService.cantidad;
  readonly totalCarrito = this.carritoService.total;


  // ------------------------------------
  // ROL Y FILTRO
  // ------------------------------------

  readonly rol = signal<'admin' | 'customer'>('customer');

  // null significa que se mostrarán todos los productos.
  readonly categoriaSeleccionada = signal<number | null>(null);

  // Permite solicitar una nueva consulta después de guardar cambios.
  private readonly recargarCatalogo$ = new Subject<void>();

  private readonly categoriaSeleccionada$ =
    toObservable(this.categoriaSeleccionada).pipe(
      distinctUntilChanged()
    );


  // ------------------------------------
  // CATEGORÍAS DESDE LA API
  // ------------------------------------

  readonly categorias$: Observable<Categoria[] | null> =
    this.categoriaService.obtenerTodas().pipe(
      startWith(null),
      shareReplay({ bufferSize: 1, refCount: true })
    );


  // ------------------------------------
  // PRODUCTOS DESDE LA API
  // ------------------------------------

  readonly productos$: Observable<Producto[] | null> =
    combineLatest([
      this.categoriaSeleccionada$,
      this.recargarCatalogo$.pipe(startWith(undefined))
    ]).pipe(
      switchMap(([categoryId]) => {

        // Consulta todos los productos o consulta por categoryId.
        const solicitud$ = categoryId === null
          ? this.productoService.obtenerTodos()
          : this.productoService.obtenerPorCategoria(categoryId);

        // null indica que la solicitud todavía está en curso.
        return solicitud$.pipe(
          startWith(null as Producto[] | null)
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );


  // ------------------------------------
  // OPERACIONES DE CREAR, EDITAR Y ELIMINAR
  // ------------------------------------

  private readonly solicitudesOperacion$ =
    new Subject<SolicitudOperacion>();

  readonly resultadoOperacion$: Observable<ResultadoOperacion | null> =
    this.solicitudesOperacion$.pipe(
      concatMap((solicitud) => {

        // Valores iniciales para construir la solicitud.
        let peticion$: Observable<unknown> = of(null);
        let mensajeExito = '';

        switch (solicitud.tipo) {
          case 'crear':
            peticion$ = this.productoService.crear(solicitud.datos);
            mensajeExito = 'Producto creado correctamente.';
            break;

          case 'actualizar':
            peticion$ = this.productoService.actualizar(
              solicitud.id,
              solicitud.cambios
            );
            mensajeExito = 'Producto actualizado correctamente.';
            break;

          case 'eliminar':
            peticion$ = this.productoService.eliminar(solicitud.id);
            mensajeExito = 'Producto eliminado correctamente.';
            break;
        }

        return peticion$.pipe(
          tap(() => {
            // Recargamos el catálogo después de una operación exitosa.
            this.recargarCatalogo$.next();

            if (solicitud.tipo === 'actualizar') {
              this.productoEnEdicion.set(null);
            }
          }),

          map((): ResultadoOperacion => ({
            tipo: 'exito',
            mensaje: mensajeExito
          })),

          catchError((error: unknown) => {
            console.error('Error en la operación:', error);

            return of({
              tipo: 'error' as const,
              mensaje:
                this.productoService.errorOperacion() ??
                'No se pudo completar la operación. Intenta nuevamente.'
            });
          })
        );
      }),
      startWith(null),
      shareReplay({ bufferSize: 1, refCount: true })
    );


  // ------------------------------------
  // FORMULARIO DE CREACIÓN
  // ------------------------------------

  readonly nuevoTitulo = signal('');
  readonly nuevoPrecio = signal(0);
  readonly nuevaDescripcion = signal('');
  readonly nuevaCategoriaId = signal<number | null>(null);
  readonly nuevaImagen = signal(
    'https://placehold.co/300x300?text=Producto'
  );

  readonly errorFormulario = signal<string | null>(null);

  crearProducto(): void {
    const titulo = this.nuevoTitulo().trim();
    const precio = this.nuevoPrecio();
    const descripcion = this.nuevaDescripcion().trim();
    const categoryId = this.nuevaCategoriaId();
    const imagen = this.nuevaImagen().trim();

    if (
      titulo === '' ||
      descripcion === '' ||
      precio <= 0 ||
      categoryId === null ||
      imagen === ''
    ) {
      this.errorFormulario.set(
        'Completa el título, la descripción, el precio, la categoría y la imagen.'
      );
      return;
    }

    this.errorFormulario.set(null);

    // La API recibe el ID de la categoría al crear el producto.
    const datos: Partial<Producto> & { categoryId: number } = {
      title: titulo,
      price: precio,
      description: descripcion,
      images: [imagen],
      categoryId
    };

    this.solicitudesOperacion$.next({
      tipo: 'crear',
      datos
    });

    // Limpiamos los campos después de enviar la solicitud.
    this.nuevoTitulo.set('');
    this.nuevoPrecio.set(0);
    this.nuevaDescripcion.set('');
    this.nuevaCategoriaId.set(null);
  }

  cambiarNuevoTitulo(event: Event): void {
    this.nuevoTitulo.set(
      (event.target as HTMLInputElement).value
    );
  }

  cambiarNuevoPrecio(event: Event): void {
    this.nuevoPrecio.set(
      Number((event.target as HTMLInputElement).value)
    );
  }

  cambiarNuevaDescripcion(event: Event): void {
    this.nuevaDescripcion.set(
      (event.target as HTMLTextAreaElement).value
    );
  }

  cambiarNuevaCategoria(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;

    this.nuevaCategoriaId.set(
      valor === '' ? null : Number(valor)
    );
  }

  cambiarNuevaImagen(event: Event): void {
    this.nuevaImagen.set(
      (event.target as HTMLInputElement).value
    );
  }


  // ------------------------------------
  // FORMULARIO DE EDICIÓN
  // ------------------------------------

  readonly productoEnEdicion = signal<Producto | null>(null);
  readonly tituloEdicion = signal('');
  readonly precioEdicion = signal(0);

  editarProducto(producto: Producto): void {
    this.productoEnEdicion.set(producto);
    this.tituloEdicion.set(producto.title);
    this.precioEdicion.set(producto.price);
  }

  cambiarTituloEdicion(event: Event): void {
    this.tituloEdicion.set(
      (event.target as HTMLInputElement).value
    );
  }

  cambiarPrecioEdicion(event: Event): void {
    this.precioEdicion.set(
      Number((event.target as HTMLInputElement).value)
    );
  }

  guardarEdicion(): void {
    const producto = this.productoEnEdicion();

    if (producto === null) {
      return;
    }

    if (
      this.tituloEdicion().trim() === '' ||
      this.precioEdicion() <= 0
    ) {
      this.errorFormulario.set(
        'El título y el precio deben tener valores válidos.'
      );
      return;
    }

    this.errorFormulario.set(null);

    this.solicitudesOperacion$.next({
      tipo: 'actualizar',
      id: producto.id,
      cambios: {
        title: this.tituloEdicion().trim(),
        price: this.precioEdicion()
      }
    });
  }

  cancelarEdicion(): void {
    this.productoEnEdicion.set(null);
    this.errorFormulario.set(null);
  }


  // ------------------------------------
  // CAMBIO DE VISTA Y CATEGORÍA
  // ------------------------------------

  alternarRol(): void {
    this.rol.update(rolActual =>
      rolActual === 'admin' ? 'customer' : 'admin'
    );
  }

  cambiarCategoria(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;

    this.categoriaSeleccionada.set(
      valor === '' ? null : Number(valor)
    );
  }


  // ------------------------------------
  // CARRITO
  // ------------------------------------

  agregarAlCarrito(producto: Producto): void {
    // No agregamos productos sin existencias.
    if (producto.stock === 0) {
      return;
    }

    // CarritoService controla el estado y lo persiste en LocalStorage.
    this.carritoService.agregar(producto);
  }

  carritoServiceVacio(): void {
    this.carritoService.vaciar();
  }


  // ------------------------------------
  // ELIMINACIÓN
  // ------------------------------------

  eliminarProducto(producto: Producto): void {
    this.solicitudesOperacion$.next({
      tipo: 'eliminar',
      id: producto.id,
      titulo: producto.title
    });
  }


  // ------------------------------------
  // TRACKBY POR ID
  // ------------------------------------

  trackById(_indice: number, producto: Producto): number {
    return producto.id;
  }

  trackByCategoriaId(
    _indice: number,
    categoria: Categoria
  ): number {
    return categoria.id;
  }
}