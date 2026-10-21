import { Component } from '@angular/core';
import { CatalogoPageComponent } from './pages/catalogo-page/catalogo-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CatalogoPageComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}