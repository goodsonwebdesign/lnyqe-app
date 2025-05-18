import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Store } from '@ngrx/store';
import * as AppActions from '../../../store/actions/app.actions';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `<div></div>` // Empty template since we're using global loading
})
export class CallbackComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private auth0Service = inject(Auth0Service);
  private store = inject(Store);
  
  // Add a flag to prevent multiple redirects
  private hasRedirected = false;

  ngOnInit(): void {
    console.log('Callback component initialized');
    
    // Force break any refresh loops
    if (window.sessionStorage.getItem('breaking_auth_loop')) {
      console.log('Breaking auth loop');
      // Just go to home without any auth processing
      this.router.navigate(['/']);
      this.store.dispatch(AppActions.appLoaded());
      return;
    }
    
    // Set a flag to break out of any potential loops on next refresh
    window.sessionStorage.setItem('breaking_auth_loop', 'true');
    
    // Remove the break flag after 5 seconds - this ensures we only break one refresh cycle
    setTimeout(() => {
      window.sessionStorage.removeItem('breaking_auth_loop');
    }, 5000);
    
    // Display loading state
    this.store.dispatch(AppActions.appLoading());
    
    // Simple and direct approach - just redirect to dashboard after a short delay
    // This skips complex auth state handling that might be causing loops
    setTimeout(() => {
      if (this.hasRedirected) return;
      
      this.hasRedirected = true;
      console.log('Redirect timeout triggered, navigating to dashboard');
      this.router.navigate(['/dashboard']);
      this.store.dispatch(AppActions.appLoaded());
    }, 1000);
    
    // As a backup, check auth state once and only once
    this.auth0Service.isAuthenticated$.pipe(
      take(1) // *** CRITICAL FIX - only take one emission from this observable ***
    ).subscribe(isAuthenticated => {
      if (this.hasRedirected) return;
      
      this.hasRedirected = true;
      console.log('Auth state in callback:', isAuthenticated);
      
      // Clear loading state
      this.store.dispatch(AppActions.appLoaded());
      
      if (isAuthenticated) {
        console.log('User authenticated, redirecting to dashboard');
        this.router.navigate(['/dashboard']);
      } else {
        console.log('User not authenticated, redirecting to home');
        this.router.navigate(['/']);
      }
    });
  }
}
