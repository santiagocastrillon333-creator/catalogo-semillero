import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

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

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Representar el estado de filtros y paginación reflejado en la URL.
  private readonly estadoUrl$ = this.route.queryParamMap.pipe(
    map(parametros => {
      const categoriaOriginal = parametros.get('categoria');
      const paginaOriginal = parametros.get('pagina');
      const categoriaNumero = categoriaOriginal === null
        ? null
        : Number(categoriaOriginal);
      const paginaNumero = paginaOriginal === null
        ? 1
        : Number(paginaOriginal);
      const categoriaId = Number.isInteger(categoriaNumero) && categoriaNumero! > 0
        ? categoriaNumero
        : null;
      const pagina = Number.isInteger(paginaNumero) && paginaNumero! > 0
        ? paginaNumero
        : 1;

      return {
        categoriaOriginal,
        paginaOriginal,
        categoriaId,
        pagina,
      };
    }),
    tap(estado => {
      // Eliminar categorías inválidas y normalizar páginas no válidas en la URL.
      const categoriaValida = estado.categoriaOriginal === null ||
        estado.categoriaId !== null;
      const paginaValida = estado.paginaOriginal === null ||
        (estado.paginaOriginal.trim() !== '' &&
          Number.isInteger(Number(estado.paginaOriginal)) &&
          Number(estado.paginaOriginal) > 0);
      const categoriaNormalizada = estado.categoriaOriginal !== null &&
        estado.categoriaId !== null &&
        String(estado.categoriaId) !== estado.categoriaOriginal;
      const paginaNormalizada = estado.paginaOriginal !== null &&
        String(estado.pagina) !== estado.paginaOriginal;

      if (!categoriaValida || !paginaValida ||
          categoriaNormalizada || paginaNormalizada) {
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            categoria: categoriaValida ? estado.categoriaId : null,
            pagina: paginaValida ? estado.pagina : 1,
          },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private readonly tamanoPagina = 8;

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

  private readonly productosFiltrados$: Observable<Producto[] | null> =
    combineLatest([
      this.estadoUrl$.pipe(
        map(estado => estado.categoriaId),
        distinctUntilChanged()
      ),
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

  // Calcular la página local y corregir la URL si excede el rango disponible.
  readonly productos$: Observable<{
    productos: Producto[];
    paginaActual: number;
    totalPaginas: number;
    totalProductos: number;
  } | null> = combineLatest([
    this.productosFiltrados$,
    this.estadoUrl$
  ]).pipe(
    map(([productos, estado]) => {
      if (productos === null) {
        return null;
      }

      const totalPaginas = Math.max(
        1,
        Math.ceil(productos.length / this.tamanoPagina)
      );
      const paginaActual = Math.min(estado.pagina, totalPaginas);
      const inicio = (paginaActual - 1) * this.tamanoPagina;

      return {
        productos: productos.slice(inicio, inicio + this.tamanoPagina),
        paginaActual,
        totalPaginas,
        totalProductos: productos.length,
      };
    }),
    tap(resultado => {
      const estado = this.ultimoEstadoUrl;
      if (resultado !== null && estado !== null &&
          resultado.paginaActual !== estado.pagina) {
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { pagina: resultado.paginaActual },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private ultimoEstadoUrl: { categoriaId: number | null; pagina: number } | null = null;

  constructor() {
    // Sincronizar los controles una vez inicializado el estado del componente.
    this.estadoUrl$
      .pipe(takeUntilDestroyed())
      .subscribe(estado => {
        this.ultimoEstadoUrl = {
          categoriaId: estado.categoriaId,
          pagina: estado.pagina,
        };
        this.categoriaSeleccionada.set(estado.categoriaId);
      });
  }


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
            // Solicitar una nueva consulta después de una operación exitosa.
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

    // Restablecer los campos después de enviar la solicitud.
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
    const categoriaId = valor === '' ? null : Number(valor);

    // Actualizar la URL y reiniciar la página al cambiar de categoría.
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        categoria: Number.isInteger(categoriaId) && categoriaId! > 0
          ? categoriaId
          : null,
        pagina: 1,
      },
      queryParamsHandling: 'merge',
    });
  }

  cambiarPagina(pagina: number): void {
    // Mantener el filtro actual al cambiar la página del catálogo.
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pagina },
      queryParamsHandling: 'merge',
    });
  }


  // ------------------------------------
  // CARRITO
  // ------------------------------------

  agregarAlCarrito(producto: Producto): void {
    // Evitar agregar productos sin existencias.
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
