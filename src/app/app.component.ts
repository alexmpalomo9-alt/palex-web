import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'palex-web';
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Evita que cualquier traducción automática afecte la app
    this.renderer.setAttribute(this.el.nativeElement, 'translate', 'no');
  }
}
