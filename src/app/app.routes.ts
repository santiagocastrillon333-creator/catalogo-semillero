import { Routes } from '@angular/router';
import { CatalogoPageComponent } from './pages/catalogo-page/catalogo-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { NoEncontradoComponent } from './pages/no-encontrado/no-encontrado.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

// Definir las rutas disponibles y el componente asociado a cada URL.
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'productos',
    pathMatch: 'full',
  },
  {
    path: 'productos/:id',
    loadComponent: () =>
      import('./pages/detalle-producto/detalle-producto.component').then(
        modulo => modulo.DetalleProductoComponent
      ),
    title: 'Detalle del producto',
  },
  {
    path: 'productos',
    component: CatalogoPageComponent,
    title: 'Catálogo de productos',
  },
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'Iniciar sesión',
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./pages/carrito-page/carrito-page.component').then(
        modulo => modulo.CarritoPageComponent
      ),
    canActivate: [authGuard],
    title: 'Carrito de compras',
  },
  {
    path: 'admin',
    // Cargar la configuración hija solo después de permitir la coincidencia de /admin.
    canMatch: [adminGuard],
    loadChildren: () =>
      import('./pages/admin/admin.routes').then(modulo => modulo.ADMIN_ROUTES),
  },
  {
    // Mantener la ruta comodín al final para resolver URLs no reconocidas.
    path: '**',
    component: NoEncontradoComponent,
    title: 'Página no encontrada',
  },
];
