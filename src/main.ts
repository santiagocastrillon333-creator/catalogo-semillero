// Permite registrar datos de configuración regional en Angular.
import { registerLocaleData } from '@angular/common';

// Importa los datos regionales del español de Colombia.
import localeEsCo from '@angular/common/locales/es-CO';

// Importa la función que inicia la aplicación standalone.
import { bootstrapApplication } from '@angular/platform-browser';

// Importa el componente raíz.
import { AppComponent } from './app/app.component';

// Importa la configuración de la aplicación.
import { appConfig } from './app/app.config';

// Registra los datos regionales antes de iniciar Angular.
registerLocaleData(localeEsCo);

// Inicia la aplicación con su configuración.
bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
