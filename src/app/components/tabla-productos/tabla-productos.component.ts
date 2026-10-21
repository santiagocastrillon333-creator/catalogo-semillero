import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/Producto';

@Component({
  selector: 'app-tabla-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-productos.component.html',
  styleUrls: ['./tabla-productos.component.css']
})
export class TablaProductosComponent {

  // Recibe del padre la lista de productos.
  @Input({ required: true }) productos!: Producto[];

  // Emite el producto que se desea editar.
  @Output() editar = new EventEmitter<Producto>();

  // Emite el producto que se desea eliminar.
  @Output() eliminar = new EventEmitter<Producto>();

  // emitir el evento al pulsar el botón Editar.
  solicitarEdicion(producto: Producto): void {
    this.editar.emit(producto);
  }

  //emitir el evento al pulsar el botón Eliminar.
  solicitarEliminacion(producto: Producto): void {
    this.eliminar.emit(producto);
  }

  // Identifica cada fila por el ID del producto.
  trackById(_indice: number, producto: Producto): number {
    return producto.id;
  }
}