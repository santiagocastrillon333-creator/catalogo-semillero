import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { Producto } from '../../models/Producto';
import { ProductoService } from '../../services/producto.service';

type EstadoRelacionados = 'cargando' | 'listo' | 'error';

interface EstadoDetalle {
  cargando: boolean;
  producto: Producto | null;
  mensajeError: string | null;
  relacionados: Producto[];
  estadoRelacionados: EstadoRelacionados;
}

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-producto.component.html',
  styleUrls: ['./detalle-producto.component.css'],
})
export class DetalleProductoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productoService = inject(ProductoService);

  // Consultar cada identificador de ruta y cancelar la solicitud anterior al cambiarlo.
  readonly detalle$: Observable<EstadoDetalle> = this.route.paramMap.pipe(
    map(parametros => Number(parametros.get('id'))),
    switchMap(id => {
      if (!Number.isInteger(id) || id < 1) {
        return of({
          cargando: false,
          producto: null,
          mensajeError: 'El identificador del producto no es válido.',
          relacionados: [],
          estadoRelacionados: 'listo' as const,
        });
      }

      return this.productoService.obtenerPorId(id).pipe(
        switchMap(producto => this.consultarRelacionados(producto)),
        startWith({
          cargando: true,
          producto: null,
          mensajeError: null,
          relacionados: [],
          estadoRelacionados: 'cargando' as const,
        }),
        catchError((error: unknown) => {
          const noEncontrado = this.esError404(error);
          return of({
            cargando: false,
            producto: null,
            mensajeError: noEncontrado
              ? 'No se encontró el producto solicitado.'
              : 'No se pudo cargar el producto. Intenta nuevamente.',
            relacionados: [],
            estadoRelacionados: 'listo' as const,
          });
        })
      );
    })
  );

  private consultarRelacionados(producto: Producto): Observable<EstadoDetalle> {
    // Filtrar productos de la misma categoría y excluir el producto actual.
    return this.productoService.obtenerPorCategoria(producto.category.id).pipe(
      map(productos => ({
        cargando: false,
        producto,
        mensajeError: null,
        relacionados: productos
          .filter(relacionado => relacionado.id !== producto.id)
          .slice(0, 4),
        estadoRelacionados: this.productoService.errorCarga()
          ? 'error' as const
          : 'listo' as const,
      })),
      startWith({
        cargando: false,
        producto,
        mensajeError: null,
        relacionados: [],
        estadoRelacionados: 'cargando' as const,
      }),
      catchError(() => of({
        cargando: false,
        producto,
        mensajeError: null,
        relacionados: [],
        estadoRelacionados: 'error' as const,
      }))
    );
  }

  private esError404(error: unknown): boolean {
    return typeof error === 'object' && error !== null &&
      'status' in error && error.status === 404;
  }
}
