// Permite registrar los datos regionales en Angular.
import { registerLocaleData } from '@angular/common';

// Datos regionales del español de Colombia.
import localeEsCo from '@angular/common/locales/es-CO';

// Registra la configuración regional antes de iniciar la aplicación.
registerLocaleData(localeEsCo);
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

// Habilitar HttpClient para realizar solicitudes HTTP.
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideHttpClient(),
    // Registrar el proveedor standalone que activa la navegación por rutas.
    provideRouter(routes),
  ]
};
