# Catálogo Semillero Angular

Aplicación de catálogo de productos desarrollada con Angular 17 y componentes standalone.

## Requisitos previos

- Node.js compatible con Angular 17.
- npm.
- Angular CLI.

## Instalación

Clona el proyecto, entra en su carpeta y ejecuta:


npm install


## Ejecutar el proyecto

Inicia el servidor de desarrollo con:

ng serve


Abre en el navegador: http://localhost:4200/

Para detener el servidor, presiona 'Ctrl + C' en la terminal.

## Compilar el proyecto

Ejecuta:

ng build


## Funcionalidades

- Vista de administrador con tabla de productos.
- Vista de cliente con tarjetas de productos.
- Cambio de rol sin autenticación.
- Filtro por categoría.
- Carrito con cantidad de ítems y total.
- Comunicación entre componentes mediante '@Input()' y '@Output()'.
- Estado reactivo gestionado con 'signal()' y 'computed()'.

## Estructura general

- 'src/app/models/': interfaces y modelos de datos.
- 'src/app/components/': componentes reutilizables.
- 'src/app/pages/': páginas y componentes contenedores.

### Preguntas de sustentación Taller 01
En la sustentación vas a responder, sobre tu propio código:
1. ¿Por qué TarjetaProductoComponent emite un evento en vez de agregar el producto al carrito directamente? ¿Qué se rompería si lo hiciera?
RTA/porque el componente de lka tarjketa es de presentació y su responsabilidad es mostrar un producto y emitir un evento cuando el usuario pulsa «Agregar al carrito» y es el componente padre, "CatalogoPageComponent", quien recibe ese evento y actualiza el carrito o el que determina el comportamiento.
2. ¿Qué pasaría en tu listado si omitieras trackBy y permitieras reordenar los productos?
RTA/si los productos se reciben de nuevo como objetos diferentes, podría recrear elementos del DOM innecesariamente, ento nces usar el id ayuda a reutilizar los elementos
3. ¿Por qué la lista filtrada es un computed() y no un signal que actualizás en cada cambio de filtro?
RTA/Porque la lista filtrada depende de dos datos que ya existen: el arreglo de productos y la categoría seleccionada. Con computed() se calcula la lista automáticamente cuando cambia cualquiera de esas dependencias.
4. Mostrá un input que hayas declarado como requerido y explicá por qué ese y no otro.
RTA/En "TarjetaProductoComponent" declare:
"@Input({ required: true }) producto!: Producto;" y es requerido porque la tarjeta necesita recibir un producto para mostrar su imagen, título, precio y categoría. No tendría sentido utilizarla sin ese dato.
5. ¿Qué diferencia hay entre @Input() y los signal inputs, y por qué en WPOSS usamos el primero hoy?
RTA/
Ambos permiten recibir datos del componente padre al hijo, pero funcionan distinto:
- @Input() recibe el dato en una propiedad normal.
- Signal input, declarado con input(), recibe el dato mediante un signal de solo lectura.
En el taller usamos @Input() porque trabajamos con Angular 17 y los requisitos piden expresamente la API de decoradores. En Angular 17, los signal inputs estaban en fase Developer Preview, mientras que la API tradicional seguía siendo estable y compatible.

### Preguntas de sustentacion Taller 02

1. ¿Por qué tu servicio devuelve un Observable en vez de ejecutar la petición y devolver los datos?
RTA:

Mi servicio devuelve un "Observable" porque la comunicación con la API es asíncrona y la respuesta puede tardar. El "Observable" representa esa operación y permite recibir los datos cuando llegan, gestionar errores y utilizar operadores de RxJS. Después utilizo el pipe async en la plantilla para recibir los datos sin hacer suscripciones manuales en el componente.

2. Mostrá dónde usás el pipe async. Si usaras el mismo Observable dos veces en esa plantilla, ¿qué pasaría?
RTA:

Utilizo el pipe async en catalogo-page.component.html para recibir los productos y las categorías:
<!-- Recibe las categorías del servicio. -->
<ng-container *ngIf="categorias$ | async as categorias">
  <!-- Aquí puedo utilizar la lista de categorías. -->
</ng-container>

<!-- Recibe los productos del servicio. -->
<ng-container *ngIf="productos$ | async as productos">
  <!-- Aquí puedo utilizar la lista de productos. -->
</ng-container>


Cada uso de async crea una suscripción, si yo utilizara el mismo "Observable" de "HttpClient" varias veces sin compartirlo, podría generar varias peticiones HTTP. En mi servicio utilizo "shareReplay()" para compartir el resultado entre suscriptores concurrentes y evitar solicitudes duplicadas innecesarias.

3. ¿Por qué productos en CarritoService está expuesto con asReadonly()?
RTA:

Porque quiero que los componentes puedan consultar los productos del carrito, pero no modificarlos directamente. Por eso utilizo "asReadonly()", que expone el signal para lectura. Las modificaciones se hacen mediante los métodos "agregar()", "quitar()" y "vaciar()" del servicio, que también guardan los cambios en "LocalStorage".