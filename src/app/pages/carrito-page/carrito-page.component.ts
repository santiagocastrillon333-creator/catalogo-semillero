import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-carrito-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito-page.component.html',
  styleUrls: ['./carrito-page.component.css'],
})
export class CarritoPageComponent {
  private readonly carritoService = inject(CarritoService);

  // Leer las señales del servicio sin duplicar el estado del carrito.
  readonly productos = this.carritoService.productos;
  readonly cantidad = this.carritoService.cantidad;
  readonly total = this.carritoService.total;

  quitar(id: number): void {
    this.carritoService.quitar(id);
  }

  vaciar(): void {
    this.carritoService.vaciar();
  }
}
