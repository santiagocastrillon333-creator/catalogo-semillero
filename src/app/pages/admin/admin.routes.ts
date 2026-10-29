import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminProductosComponent } from './admin-productos/admin-productos.component';
import { ProductoFormComponent } from './producto-form/producto-form.component';
import { cambiosSinGuardarGuard } from '../../guards/cambios-sin-guardar.guard';

// Definir las rutas hijas que se incorporan al descargar el módulo administrativo.
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'productos',
      },
      {
        path: 'productos/nuevo',
        component: ProductoFormComponent,
        canDeactivate: [cambiosSinGuardarGuard],
        title: 'Crear producto',
      },
      {
        path: 'productos/:id/editar',
        component: ProductoFormComponent,
        canDeactivate: [cambiosSinGuardarGuard],
        title: 'Editar producto',
      },
      {
        path: 'productos',
        component: AdminProductosComponent,
        title: 'Administración de productos',
      },
    ],
  },
];
