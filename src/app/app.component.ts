import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EncabezadoComponent } from './components/encabezado/encabezado.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EncabezadoComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
