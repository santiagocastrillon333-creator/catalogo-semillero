import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import type { Producto } from '../../models/Producto';

import { TarjetaProductoComponent } from
  '../../components/tarjeta-producto/tarjeta-producto.component';

import { TablaProductosComponent } from
  '../../components/tabla-productos/tabla-productos.component';

@Component({
  selector: 'app-catalogo-page',
  standalone: true,

  // Permite usar ngIf, ngFor y ngSwitch y de los componentes hijos.
  imports: [
    CommonModule,
    TarjetaProductoComponent,
    TablaProductosComponent
  ],

  templateUrl: './catalogo-page.component.html',
  styleUrls: ['./catalogo-page.component.css']
})
export class CatalogoPageComponent {

  // 1. Único arreglo completo de productos.
  productos = signal<Producto[]>([
    {
      id: 1,
      title: 'Audífonos inalámbricos',
      price: 85000,
      description: 'Audífonos Bluetooth con sonido estéreo.',
      images: ['https://placehold.co/300x300?text=Audifonos'],
      stock: 10,
      category: { id: 1, name: 'Audio' }
    },
    {
      id: 2,
      title: 'Parlante portátil',
      price: 120000,
      description: 'Parlante compacto con conexión Bluetooth.',
      images: ['https://placehold.co/300x300?text=Parlante'],
      stock: 0,
      category: { id: 1, name: 'Audio' }
    },
    {
      id: 3,
      title: 'Teclado mecánico',
      price: 150000,
      description: 'Teclado mecánico para trabajar y jugar.',
      images: ['https://placehold.co/300x300?text=Teclado'],
      stock: 8,
      category: { id: 2, name: 'Computación' }
    },
    {
      id: 4,
      title: 'Mouse inalámbrico',
      price: 60000,
      description: 'Mouse ergonómico inalámbrico.',
      images: ['https://placehold.co/300x300?text=Mouse'],
      stock: 20,
      category: { id: 2, name: 'Computación' }
    },
    {
      id: 5,
      title: 'Lámpara de escritorio',
      price: 45000,
      description: 'Lámpara LED para estudiar.',
      images: ['https://placehold.co/300x300?text=Lampara'],
      stock: 6,
      category: { id: 3, name: 'Accesorios' }
    },
    {
      id: 6,
      title: 'Hub USB',
      price: 70000,
      description: 'Hub USB con varios puertos.',
      images: ['https://placehold.co/300x300?text=HubUSB'],
      stock: 12,
      category: { id: 3, name: 'Accesorios' }
    }
  ]);

  // 2. Rol inicial de la aplicación.
  rol = signal<'admin' | 'customer'>('customer');

  // 3. Categoría seleccionada. null son todas.
  categoriaSeleccionada = signal<number | null>(null);

  // 4. Categorías únicas derivadas de los productos.
  categorias = computed(() => {
    const categoriasProductos = this.productos()
      .map(producto => producto.category);

    return categoriasProductos.filter((categoria, indice, lista) =>
      lista.findIndex(item => item.id === categoria.id) === indice
    );
  });

  // 5. La lista filtrada se calcula automáticamente, no se actualioza manualmente con .set().
  
  productosFiltrados = computed(() => {
    const lista = this.productos();
    const categoriaId = this.categoriaSeleccionada();

    if (categoriaId === null) {
      return lista;
    }

    return lista.filter(
      producto => producto.category.id === categoriaId
    );
  });

  // 6. Carrito: cada elemento representa un producto agregado.
  carrito = signal<Producto[]>([]);

  // 7. Cantidad de elementos del carrito.
  cantidadItemsCarrito = computed(() => this.carrito().length);

  // 8. Suma del precio de los productos del carrito.
  totalCarrito = computed(() =>
    this.carrito().reduce(
      (total, producto) => total + producto.price,
      0
    )
  );

  // Alterna entre administrador y cliente.
  alternarRol(): void {
    this.rol.update(rolActual =>
      rolActual === 'admin' ? 'customer' : 'admin'
    );
  }

  // use .set() solamente para actualizar la categoría seleccionada, no para guardar la lista filtrada. 
  // y angular recalcula productosFiltrados automáticamente mediante computed().
  cambiarCategoria(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;

    this.categoriaSeleccionada.set(
      valor === '' ? null : Number(valor)
    );
  }

  // Recibe el producto emitido por la tarjeta.
  agregarAlCarrito(producto: Producto): void {
    if (producto.stock === 0) {
      return;
    }

    this.carrito.update(lista => [...lista, producto]);
  }

  // Elimina un producto desde la vista de administración.
  eliminarProducto(producto: Producto): void {
    this.productos.update(lista =>
      lista.filter(item => item.id !== producto.id)
    );
  }

  // Punto de entrada para implementar la edición más adelante.
  editarProducto(producto: Producto): void {
    console.log('Producto seleccionado para editar:', producto);
  }

  // Identifica los productos por su ID en *ngFor.
  trackById(_indice: number, producto: Producto): number {
    return producto.id;
  }

  // Identifica las categorías por su ID en *ngFor.
  trackByCategoriaId(
    _indice: number,
    categoria: { id: number; name: string }
  ): number {
    return categoria.id;
  }
}