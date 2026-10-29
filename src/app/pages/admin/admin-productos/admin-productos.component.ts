import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, startWith, switchMap } from 'rxjs';
import { Producto } from '../../../models/Producto';
import { ProductoService } from '../../../services/producto.service';
import { TablaProductosComponent } from '../../../components/tabla-productos/tabla-productos.component';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, TablaProductosComponent],
  templateUrl: './admin-productos.component.html',
  styleUrls: ['./admin-productos.component.css'],
})
export class AdminProductosComponent {
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly recargar$ = new Subject<void>();

  readonly errorCarga = this.productoService.errorCarga;
  readonly errorOperacion = this.productoService.errorOperacion;
  readonly productos$: Observable<Producto[] | null> = this.recargar$.pipe(
    startWith(undefined),
    switchMap(() => this.productoService.obtenerTodos().pipe(startWith(null)))
  );

  editar(producto: Producto): void {
    void this.router.navigate(['/admin/productos', producto.id, 'editar']);
  }

  eliminar(producto: Producto): void {
    const confirmar = this.document.defaultView?.confirm(
      `¿Eliminar el producto «${producto.title}»?`
    );
    if (!confirmar) {
      return;
    }

    this.productoService.eliminar(producto.id).subscribe({
      next: () => this.recargar$.next(),
      // Mostrar el error mediante la señal enlazada en la plantilla.
      error: () => undefined,
    });
  }
}
