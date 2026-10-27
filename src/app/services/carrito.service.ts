// Injectable registra el servicio en la inyección de dependencias.
// inject permite solicitar dependencias de Angular.
// signal guarda el estado del carrito.
// computed calcula valores derivados.
import {
  Injectable,
  computed,
  inject,
  signal,
  PLATFORM_ID
} from '@angular/core';

// Permite comprobar si estamos ejecutando en el navegador.
import { isPlatformBrowser } from '@angular/common';

// Importamos la estructura de los productos.
import { Producto } from '../models/Producto';

@Injectable({
  // Angular proporciona una instancia compartida del servicio.
  providedIn: 'root'
})
export class CarritoService {

  // Identificador utilizado para guardar y recuperar el carrito.
  private readonly CLAVE = 'carrito_wposs';

  // Permite distinguir navegador de servidor durante el prerenderizado.
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);

  // Estado privado: solamente este servicio puede modificarlo directamente.
  private readonly items = signal<Producto[]>([]);

  // Expone el carrito para lectura, sin permitir set() ni update() desde fuera.
  readonly productos = this.items.asReadonly();

  // Calcula la cantidad de productos presentes en el carrito.
  readonly cantidad = computed(() => this.items().length);

  // Calcula la suma de los precios de los productos del carrito.
  readonly total = computed(() =>
    this.items().reduce(
      (suma, producto) => suma + producto.price,
      0
    )
  );

  constructor() {
    // Al crear el servicio, se intenta restaurar el carrito guardado.
    this.restaurar();
  }

  // Agrega un producto y guarda el nuevo estado.
  agregar(producto: Producto): void {
    this.items.update(lista => [...lista, producto]);

    // Persistir después de modificar el carrito.
    this.persistir();
  }

  // Quitaa todos los productos cuyo ID coincida con el recibido.
  quitar(id: number): void {
    this.items.update(lista =>
      lista.filter(producto => producto.id !== id)
    );

    // se persitea el nuevo estado.
    this.persistir();
  }

  // Vacía el carrito y guarda el resultado.
  vaciar(): void {
    this.items.set([]);

    // También guardamos el carrito vacío.
    this.persistir();
  }

  // Recuperae el carrito de LocalStorage al construir el servicio.
  private restaurar(): void {

    // LocalStorage no existe durante el renderizado del servidor.
    if (!this.esNavegador) {
      return;
    }

    try {
      // Recuperamos el texto guardado en el navegador.
      const guardado = localStorage.getItem(this.CLAVE);

      // Si no hay datos, el signal conserva su arreglo vacío.
      if (guardado === null) {
        return;
      }

      // JSON.parse puede lanzar una excepción.
      // Declaramos el resultado como unknown porque aún no lo validamos.
      const datos: unknown = JSON.parse(guardado);

      // se compureba que sea un arreglo con productos de estructura válida.
      if (
        Array.isArray(datos) &&
        datos.every(producto => this.esProducto(producto))
      ) {
        this.items.set(datos);
      } else {
        // Si la estructura es incorrecta, comenzamos con el carrito vacío.
        this.items.set([]);
        localStorage.removeItem(this.CLAVE);
      }

    } catch (error: unknown) {

      // Si el JSON está corrupto, la aplicación no debe detenerse.
      console.error('No se pudo restaurar el carrito:', error);

      // El estado inicial seguro es un carrito vacío.
      this.items.set([]);

      // Intento quitar el valor corrupto para no volver a leerlo.
      try {
        localStorage.removeItem(this.CLAVE);
      } catch {
        // Si el navegador no permite acceder al almacenamiento,
        // se mantiene el carrito vacío y la aplicación puede continuar.
      }
    }
  }

  // Comprueba los campos fundamentales de un producto recuperado.
  // Esto evita aceptar cualquier objeto guardado en LocalStorage.
  private esProducto(valor: unknown): valor is Producto {

    if (typeof valor !== 'object' || valor === null) {
      return false;
    }

    // se trabajan con propiedades de tipo desconocido, sin utilizar any.
    const producto = valor as Record<string, unknown>;
    const categoria = producto['category'];
    const imagenes = producto['images'];

    if (typeof categoria !== 'object' || categoria === null) {
      return false;
    }

    const datosCategoria = categoria as Record<string, unknown>;

    return (
      typeof producto['id'] === 'number' &&
      typeof producto['title'] === 'string' &&
      typeof producto['price'] === 'number' &&
      Array.isArray(imagenes) &&
      imagenes.every((imagen: unknown) => typeof imagen === 'string') &&
      typeof datosCategoria['id'] === 'number' &&
      typeof datosCategoria['name'] === 'string'
    );
  }

  // Guarda el estado actual del carrito como texto JSON.
  private persistir(): void {

    // No utilizar LocalStorage en el servidor.
    if (!this.esNavegador) {
      return;
    }

    try {
      // JSON.stringify convierte el arreglo en texto para almacenarlo.
      localStorage.setItem(
        this.CLAVE,
        JSON.stringify(this.items())
      );
    } catch (error: unknown) {
      // Un problema de almacenamiento tampoco debe detener la aplicación.
      console.error('No se pudo guardar el carrito:', error);
    }
  }
}