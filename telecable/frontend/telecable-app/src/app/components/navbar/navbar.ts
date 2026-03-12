import { Component, DoCheck, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements DoCheck {

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngDoCheck() {
    this.flash();
  }

  flash() {
    this.renderer.addClass(this.elementRef.nativeElement, 'cd-flash');
    setTimeout(() => {
      this.renderer.removeClass(this.elementRef.nativeElement, 'cd-flash');
    }, 400); // The flash will last for 400ms
  }
}
