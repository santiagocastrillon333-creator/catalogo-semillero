// Injectable permite que Angular gestione el servicio mediante DI.
// inject permite solicitar dependencias de Angular.
import { Injectable, inject } from '@angular/core';

// HttpClient permite realizar solicitudes HTTP.
import { HttpClient } from '@angular/common/http';

// Observable representa el flujo de datos de la respuesta.
// of permite devolver un Observable con un valor alternativo.
// catchError permite interceptar errores.
import { Observable, of, catchError } from 'rxjs';

// Importar el tipo de categoría que acabamos de definir.
import { Categoria } from '../models/Categoria';

// Importar la URL base configurada en el entorno.
import { environment } from '../../environments/environment';

// Registra el servicio en el inyector raíz de Angular.
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  // Angular proporciona la instancia de HttpClient.
  private readonly http = inject(HttpClient);

  // Construimos la URL usando la configuración del entorno.
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  // Obtiene todas las categorías disponibles.
  // Devuelve un Observable de una lista de categorías.
  obtenerTodas(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl).pipe(

      // Si la petición falla, capturamos el error.
      catchError((error: unknown) => {
        console.error('Error al obtener las categorías:', error);

        // En lugar de propagar el error, devolvemos una lista vacía.
        return of([] as Categoria[]);
      })

    );
  }
}