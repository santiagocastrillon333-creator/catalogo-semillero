// Permite registrar los datos regionales en Angular.
import { registerLocaleData } from '@angular/common';

// Datos regionales del español de Colombia.
import localeEsCo from '@angular/common/locales/es-CO';

// Registra la configuración regional antes de iniciar la aplicación.
registerLocaleData(localeEsCo);
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
//habilitar HttpClient en Angular.
import { provideHttpClient } from '@angular/common/http';
export const appConfig: ApplicationConfig = {
  providers: [provideClientHydration(),
    // Habilitar HttpClient para realizar solicitudes HTTP.
    provideHttpClient(),
  ]
};
