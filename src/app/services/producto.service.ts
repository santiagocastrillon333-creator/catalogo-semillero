// Injectable registra el servicio en el sistema de DI.
// inject permite solicitar dependencias de Angular.
// signal permite mantener el estado de los mensajes de error.
import { Injectable, inject, signal } from '@angular/core';

// HttpClient permite realizar solicitudes HTTP a una API.
import { HttpClient } from '@angular/common/http';

// Observable representa el flujo de datos de cada operación.
// of devuelve un Observable con un valor.
// throwError permite propagar un error a quien consume el Observable.
import { Observable, of, throwError } from 'rxjs';

// catchError permite interceptar y manejar errores.
import { catchError } from 'rxjs';

// Importar el modelo que define la estructura de un producto.
import { Producto } from '../models/Producto';

// Importar la URL base configurada en el entorno.
import { environment } from '../../environments/environment';

@Injectable({
  // Angular proporciona una instancia del servicio desde el inyector raíz.
  providedIn: 'root'
})
export class ProductoService {

  // Solicitar a Angular una instancia de HttpClient.
  private readonly http = inject(HttpClient);

  // Construir la URL de productos a partir del entorno.
  private readonly apiUrl = `${environment.apiUrl}/products`;

  // Guarda el mensaje de error de las consultas del catálogo.
  // null significa que no hay ningún error registrado.
  readonly errorCarga = signal<string | null>(null);

  // Guarda errores de operaciones como crear, editar o eliminar.
  readonly errorOperacion = signal<string | null>(null);


  // ------------------------------------
  // 1. OBTENER TODOS LOS PRODUCTOS
  // ------------------------------------

  obtenerTodos(): Observable<Producto[]> {

    // Limpiarw el error anterior antes de una nueva consulta.
    this.errorCarga.set(null);

    return this.http.get<Producto[]>(this.apiUrl).pipe(

      // Si falla la solicitud, capturamos el error.
      catchError((error: unknown) => {
        console.error('Error al obtener los productos:', error);

        // Guardaer un mensaje para que el catálogo lo muestre.
        this.errorCarga.set(
          'No se pudieron cargar los productos. Intenta nuevamente.'
        );

        // Devolver una lista vacía para cumplir el requisito.
        return of([] as Producto[]);
      })
    );
  }


  // ------------------------------------
  // 2. OBTENER UN PRODUCTO POR SU ID
  // ------------------------------------

  obtenerPorId(id: number): Observable<Producto> {

    // Consultar el producto mediante su identificador.
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }


  // ------------------------------------
  // 3. CREAR UN PRODUCTO
  // ------------------------------------

  crear(producto: Partial<Producto>): Observable<Producto> {

    // Limpiar cualquier error de operación anterior.
    this.errorOperacion.set(null);

    // Enviar los datos del nuevo producto a la API.
    return this.http.post<Producto>(this.apiUrl, producto).pipe(

      // Si falla la creación, registramos y propagamos el error.
      catchError((error: unknown) => {
        console.error('Error al crear el producto:', error);

        this.errorOperacion.set(
          'No se pudo crear el producto. Intenta nuevamente.'
        );

        // El error no se oculta: quien consuma el Observable
        // podrá detectar que la operación falló.
        return throwError(() => error);
      })
    );
  }


  // ------------------------------------
  // 4. ACTUALIZAR UN PRODUCTO
  // ------------------------------------

  actualizar(
    id: number,
    cambios: Partial<Producto>
  ): Observable<Producto> {

    // Limpiar cualquier error de operación anterior.
    this.errorOperacion.set(null);

    // Enviar los cambios del producto a la API.
    return this.http.put<Producto>(
      `${this.apiUrl}/${id}`,
      cambios
    ).pipe(

      // Si falla la actualización, registramos y propagamos el error.
      catchError((error: unknown) => {
        console.error('Error al actualizar el producto:', error);

        this.errorOperacion.set(
          'No se pudo actualizar el producto. Intenta nuevamente.'
        );

        return throwError(() => error);
      })
    );
  }


  // ------------------------------------
  // 5. ELIMINAR UN PRODUCTO
  // ------------------------------------

  eliminar(id: number): Observable<boolean> {

    // se limpia cualquier error de operación anterior.
    this.errorOperacion.set(null);

    // se solicita a la API que elimine el producto.
    return this.http.delete<boolean>(
      `${this.apiUrl}/${id}`
    ).pipe(

      // Si falla la eliminación, registramos y propagamos el error.
      catchError((error: unknown) => {
        console.error('Error al eliminar el producto:', error);

        this.errorOperacion.set(
          'No se pudo eliminar el producto. Intenta nuevamente.'
        );

        return throwError(() => error);
      })
    );
  }


  // ------------------------------------
  // 6. OBTENER PRODUCTOS POR CATEGORÍA
  // ------------------------------------

  obtenerPorCategoria(categoryId: number): Observable<Producto[]> {

    // se limpia el error anterior antes de consultar la categoría.
    this.errorCarga.set(null);

    // Construimos la URL con el parámetro categoryId.
    const url = `${this.apiUrl}?categoryId=${categoryId}`;

    // consultar directamente el endpoint de la API.
    return this.http.get<Producto[]>(url).pipe(

      // Si falla la consulta, guardamos un mensaje visible.
      catchError((error: unknown) => {
        console.error('Error al filtrar los productos:', error);

        this.errorCarga.set(
          'No se pudieron cargar los productos de esta categoría. Intenta nuevamente.'
        );

        // se devuelsve una lista vacía para cumplir el requisito.
        return of([] as Producto[]);
      })
    );
  }
}