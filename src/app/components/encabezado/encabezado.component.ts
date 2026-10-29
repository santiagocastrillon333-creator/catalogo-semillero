import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-encabezado',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './encabezado.component.html',
  styleUrls: ['./encabezado.component.css'],
})
export class EncabezadoComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuarioActual;
  readonly esAdministrador = computed(() =>
    this.authService.estaAutenticado() && this.authService.tieneRol('admin')
  );

  async cerrarSesion(): Promise<void> {
    // Completar primero la salida de las áreas protegidas y respetar CanDeactivate.
    const enRutaProtegida = this.router.url.startsWith('/carrito') ||
      this.router.url.startsWith('/admin');

    if (enRutaProtegida) {
      const navegacionCompletada = await this.router.navigateByUrl('/productos');
      if (!navegacionCompletada) {
        return;
      }
    }

    this.authService.cerrarSesion();
  }
}
