import { Component, DoCheck, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements DoCheck {

  isLoggedIn = false;
  userRole: string | null = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private authService: AuthService,
    private router: Router
  ) {}

  ngDoCheck() {
    this.flash();
    this.checkAuthStatus();
  }

  flash() {
    this.renderer.addClass(this.elementRef.nativeElement, 'cd-flash');
    setTimeout(() => {
      this.renderer.removeClass(this.elementRef.nativeElement, 'cd-flash');
    }, 400);
  }

  checkAuthStatus() {
    // Verificar si estamos en el navegador (no en SSR)
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        this.isLoggedIn = true;
        const userData = JSON.parse(user);
        this.userRole = userData.rol || 'user';
      } else {
        this.isLoggedIn = false;
        this.userRole = null;
      }
    } else {
      this.isLoggedIn = false;
      this.userRole = null;
    }
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userRole = null;
    this.router.navigate(['/promos']);
  }
}
