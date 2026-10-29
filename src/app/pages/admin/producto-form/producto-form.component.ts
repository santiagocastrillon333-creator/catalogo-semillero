import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { Categoria } from '../../../models/Categoria';
import { Producto } from '../../../models/Producto';
import { CategoriaService } from '../../../services/categoria.service';
import { ProductoService } from '../../../services/producto.service';
import { PuedeSalir } from '../../../guards/cambios-sin-guardar.guard';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css'],
})
export class ProductoFormComponent implements PuedeSalir {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);

  readonly categorias$: Observable<Categoria[] | null> =
    this.categoriaService.obtenerTodas().pipe(startWith(null));

  productoId: number | null = null;
  titulo = '';
  precio = 0;
  descripcion = '';
  categoriaId: number | null = null;
  imagen = 'https://placehold.co/300x300?text=Producto';
  cambiosPendientes = false;
  guardando = false;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  constructor() {
    // Cargar los datos de edición al cambiar el parámetro de la ruta hija.
    this.route.paramMap.pipe(
      map(parametros => parametros.get('id')),
      distinctUntilChanged(),
      switchMap(id => {
        if (id === null) {
          return of({ id: null, producto: null, error: null });
        }

        const productoId = Number(id);
        if (!Number.isInteger(productoId) || productoId < 1) {
          return of({ id: null, producto: null, error: 'El identificador no es válido.' });
        }

        return this.productoService.obtenerPorId(productoId).pipe(
          map(producto => ({ id: productoId, producto, error: null })),
          catchError(() => of({
            id: productoId,
            producto: null,
            error: 'No se pudo cargar el producto para editarlo.',
          }))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(resultado => {
      this.productoId = resultado.id;
      this.mensajeError = resultado.error;
      if (resultado.producto !== null) {
        this.cargarProducto(resultado.producto);
      }
    });
  }

  marcarCambios(): void {
    this.cambiosPendientes = true;
    this.mensajeExito = null;
  }

  puedeSalir(): boolean {
    if (!this.cambiosPendientes) {
      return true;
    }

    // Evitar la pérdida accidental de cambios ante una navegación del Router.
    return this.document.defaultView?.confirm(
      'Hay cambios sin guardar. ¿Deseas abandonar el formulario?'
    ) ?? true;
  }

  descartarCambios(): void {
    this.cambiosPendientes = false;
    void this.router.navigate(['/admin/productos']);
  }

  guardar(): void {
    const titulo = this.titulo.trim();
    const descripcion = this.descripcion.trim();

    if (
      titulo === '' ||
      descripcion === '' ||
      this.precio <= 0 ||
      this.categoriaId === null ||
      this.imagen.trim() === ''
    ) {
      this.mensajeError = 'Completa todos los campos con valores válidos.';
      return;
    }

    const datos: Partial<Producto> & { categoryId: number } = {
      title: titulo,
      price: this.precio,
      description: descripcion,
      images: [this.imagen.trim()],
      categoryId: this.categoriaId,
    };

    this.guardando = true;
    this.mensajeError = null;
    const solicitud$ = this.productoId === null
      ? this.productoService.crear(datos)
      : this.productoService.actualizar(this.productoId, datos);

    solicitud$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.guardando = false;
        this.cambiosPendientes = false;
        this.mensajeExito = 'Producto guardado correctamente.';
        void this.router.navigate(['/admin/productos']);
      },
      error: () => {
        this.guardando = false;
        this.mensajeError = this.productoService.errorOperacion() ??
          'No se pudo guardar el producto.';
      },
    });
  }

  private cargarProducto(producto: Producto): void {
    this.titulo = producto.title;
    this.precio = producto.price;
    this.descripcion = producto.description;
    this.categoriaId = producto.category.id;
    this.imagen = producto.images[0] ?? '';
    this.cambiosPendientes = false;
  }
}
