import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type RolUsuario = 'admin' | 'usuario';

export interface UsuarioAutenticado {
  nombre: string;
  rol: RolUsuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly claveSesion = 'catalogo_semillero_sesion';
  private readonly plataformaId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.plataformaId);
  private readonly usuario = signal<UsuarioAutenticado | null>(null);

  // Compartir el estado reactivo de autenticación entre guards y componentes.
  readonly usuarioActual = this.usuario.asReadonly();

  constructor() {
    this.restaurarSesion();
  }

  iniciarSesion(usuario: string, clave: string): boolean {
    const nombre = usuario.trim();
    if (clave !== 'wposs123' || nombre === '') {
      return false;
    }

    // Persistir únicamente el nombre y el rol; nunca almacenar la contraseña.
    const sesion: UsuarioAutenticado = {
      nombre,
      rol: nombre.toLowerCase() === 'admin' ? 'admin' : 'usuario',
    };
    this.usuario.set(sesion);
    this.guardarSesion(sesion);
    return true;
  }

  cerrarSesion(): void {
    this.usuario.set(null);

    if (!this.esNavegador) {
      return;
    }

    try {
      localStorage.removeItem(this.claveSesion);
    } catch (error: unknown) {
      // Mantener cerrada la sesión en memoria si el almacenamiento no está disponible.
      console.error('No se pudo eliminar la sesión persistida:', error);
    }
  }

  estaAutenticado(): boolean {
    return this.usuario() !== null;
  }

  tieneRol(rol: RolUsuario): boolean {
    return this.usuario()?.rol === rol;
  }

  private restaurarSesion(): void {
    if (!this.esNavegador) {
      return;
    }

    try {
      const guardado = localStorage.getItem(this.claveSesion);
      if (guardado === null) {
        return;
      }

      const valor: unknown = JSON.parse(guardado);
      if (this.esUsuarioAutenticado(valor)) {
        this.usuario.set(valor);
      } else {
        localStorage.removeItem(this.claveSesion);
      }
    } catch (error: unknown) {
      // Ignorar una sesión ilegible y mantener la aplicación en estado anónimo.
      console.error('No se pudo restaurar la sesión:', error);
      this.usuario.set(null);
    }
  }

  private guardarSesion(sesion: UsuarioAutenticado): void {
    if (!this.esNavegador) {
      return;
    }

    try {
      localStorage.setItem(this.claveSesion, JSON.stringify(sesion));
    } catch (error: unknown) {
      // Conservar el estado en memoria si el navegador bloquea LocalStorage.
      console.error('No se pudo persistir la sesión:', error);
    }
  }

  private esUsuarioAutenticado(valor: unknown): valor is UsuarioAutenticado {
    if (typeof valor !== 'object' || valor === null) {
      return false;
    }

    const usuario = valor as Record<string, unknown>;
    return typeof usuario['nombre'] === 'string' &&
      usuario['nombre'].trim() !== '' &&
      (usuario['rol'] === 'admin' || usuario['rol'] === 'usuario');
  }
}
