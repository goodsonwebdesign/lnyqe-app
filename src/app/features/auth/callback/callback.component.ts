import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-lg">Completing authentication...</p>
      </div>
    </div>
  `
})
export class CallbackComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Check if there are Auth0 params in the URL
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') && params.has('state')) {
      // If there are, handle the authentication callback
      console.log('Callback component detected Auth0 parameters');
      this.authService.handleAuthCallback().subscribe({
        next: (result) => {
          console.log('Auth callback successfully handled by callback component');
        },
        error: (err) => {
          console.error('Auth callback error in callback component:', err);
          this.router.navigate(['/']);
        }
      });
    } else {
      // If there aren't any Auth0 params, redirect to dashboard after a brief delay
      console.log('No Auth0 parameters detected, using fallback redirect');
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000);
    }
  }
}