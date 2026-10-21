import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
registerLocaleData(localeEsCo);
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
