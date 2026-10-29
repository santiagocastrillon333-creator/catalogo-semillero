import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  usuario = '';
  clave = '';
  mensajeError: string | null = null;

  iniciarSesion(): void {
    this.mensajeError = null;

    if (!this.authService.iniciarSesion(this.usuario, this.clave)) {
      this.mensajeError = 'Usuario o contraseña incorrectos.';
      return;
    }

    // Leer volverA como query param y aceptar únicamente rutas internas permitidas.
    this.route.queryParamMap.pipe(take(1)).subscribe(parametros => {
      const destino = this.validarDestino(parametros.get('volverA'));
      void this.router.navigateByUrl(destino);
    });
  }

  private validarDestino(destino: string | null): string {
    const rutaPermitida = /^\/(?:productos(?:\/\d+)?|carrito)(?:[?#].*)?$/;
    return destino !== null && rutaPermitida.test(destino)
      ? destino
      : '/productos';
  }
}
