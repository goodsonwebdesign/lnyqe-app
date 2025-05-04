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
    // Use a try/catch block to safely handle any potential URI errors
    try {
      // We'll use a more robust approach that doesn't rely on URL parameter decoding
      // Just check if we're on the callback page
      if (window.location.pathname.endsWith('/callback')) {
        console.log('Callback component activated');

        // Let the AuthService handle the callback, but don't directly parse URL params here
        this.authService.handleAuthCallback().subscribe({
          next: () => {
            console.log('Auth callback successfully handled by callback component');
            // Success will be handled by the auth service
          },
          error: (err) => {
            console.error('Auth callback error in callback component:', err);
            this.router.navigate(['/']);
          }
        });
      } else {
        // Fallback redirect
        console.log('Not on callback path, using fallback redirect');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      }
    } catch (error) {
      // Catch any URI decoding errors or other issues
      console.error('Callback component error:', error);
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
    }
  }
}
