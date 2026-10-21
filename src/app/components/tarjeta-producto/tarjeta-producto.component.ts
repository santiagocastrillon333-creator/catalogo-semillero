import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/Producto';

@Component({
  selector: 'app-tarjeta-producto',
  standalone: true,

  // segunda causa más común de “no me renderiza nada”, es no incluir: 
  imports: [CommonModule],

  // Conecta la plantilla y los estilos del componente.
  templateUrl: './tarjeta-producto.component.html',
  styleUrls: ['./tarjeta-producto.component.css']
})
export class TarjetaProductoComponent {

  // Recibe obligatoriamente un producto desde el componente padre.
  @Input({ required: true }) producto!: Producto;

  // el modulo events en node esta compuesto por: definir, emitir y ecuchar un evento
  //defenir el evento que escuchara el padre
  @Output() productoAgregado = new EventEmitter<Producto>();

  // Se ejecuta cuando el usuario pulsa el botón.
  agregarAlCarrito(): void {
    // No permite agregar productos agotados.
    if (this.producto.stock === 0) {
      return;
    }

    // Emite únicamente este producto, no el arreglo completo.
    //se delega la respoinsabilidad al componente padre
    this.productoAgregado.emit(this.producto);
  }
}