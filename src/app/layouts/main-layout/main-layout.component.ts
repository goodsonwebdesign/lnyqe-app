import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { ThemeService } from '../../core/services/theme.service';
import { FlyoutService } from '../../core/services/flyout/flyout.service';
import { catchError, EMPTY, Subscription } from 'rxjs';
import { ServiceRequestService } from '../../features/service-request/service-request.service';
import { selectIsAuthenticated, selectCurrentUser, selectIsRedirecting } from '../../store/selectors/auth.selectors';

import { Router } from '@angular/router';
import { FlyoutPosition } from '../../shared/components/ui/toolbar/toolbar.component';
import { ServiceRequestComponent } from '../../features/service-request/service-request.component';
import { UI_COMPONENTS } from '../../shared/components/ui';
import { User } from '@auth0/auth0-angular';
import { AuthActions } from '../../store/actions/auth.actions';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgOptimizedImage,
    ...UI_COMPONENTS, // This now includes LoadingSpinnerComponent
    ServiceRequestComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  // Injected Services
  private store = inject(Store);

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private serviceRequestService = inject(ServiceRequestService);
  private flyoutService = inject(FlyoutService);
  themeService = inject(ThemeService);

  // State Observables
  isRedirecting$ = this.store.select(selectIsRedirecting);

  // Component State
  isLoggedIn = false;
  user: User | null = null;
  isMobileView = window.innerWidth < 1024;

  // Static & Display Properties
  currentYear = new Date().getFullYear();
  buildInfo = '';
  deployedOn = '';
  lightModeLogo = 'https://img-lynqe.s3.us-east-2.amazonaws.com/logo-blk.png';
  darkModeLogo = 'https://img-lynqe.s3.us-east-2.amazonaws.com/logo-wht.png';

  private subscriptions = new Subscription();

  // Handle window resize
  @HostListener('window:resize')
  onResize() {
    this.handleResize();
  }

  ngOnInit() {
    // Set a default value first to avoid any issues if the request fails
    this.buildInfo = 'Development Build';

    // Only load build info if not in a problematic URL path
    // This prevents Vite from trying to decode potentially malformed URIs
    if (!window.location.pathname.includes('%') && !window.location.search.includes('%')) {
      this.loadBuildInfo();
    }

    // Subscribe to authentication state
    this.subscriptions.add(
      this.store.select(selectIsAuthenticated).subscribe((isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
        // Removed auto-open sidenav behavior to keep it always closed by default
        this.cdr.markForCheck();
      }),
    );

    // Subscribe to user data
    this.subscriptions.add(
      this.store.select(selectCurrentUser).subscribe((user) => {
        this.user = user;
        this.cdr.markForCheck();
      }),
    );

    // Initial check for mobile view
    this.handleResize();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when component is destroyed
    this.subscriptions.unsubscribe();
  }

  // Handle window resize
  private handleResize(): void {
    this.isMobileView = window.innerWidth < 1024;

    this.cdr.markForCheck();
  }

  private loadBuildInfo() {
    try {
      // Avoid URL parameters completely to prevent URI decoding issues
      const safePath = 'build-info.txt';

      this.http
        .get(safePath, {
          responseType: 'text',
          // Use headers instead of URL parameters
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        })
        .pipe(
          catchError((error) => {
            console.error('Error loading build info:', error);
            this.buildInfo = 'Development Build';
            return EMPTY;
          }),
        )
        .subscribe({
          next: (data: string) => {
            if (data && typeof data === 'string') {
              this.buildInfo = data.trim();
              // Extract timestamp from the build info if possible
              if (data.includes('Build date:')) {
                const dateStr = data.replace('Build date:', '').trim();
                this.deployedOn = this.formatDate(dateStr);
              }
            }
          },
        });
    } catch (error) {
      // Safety catch block to prevent any URI errors from breaking the app
      console.error('Error in loadBuildInfo:', error);
      this.buildInfo = 'Development Build';
    }
  }

  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  openServiceRequestFlyout(position: FlyoutPosition = 'right'): void {
    this.serviceRequestService.openServiceRequest(position);
  }

  // Get user's first name for greeting
  getUserFirstName(): string {
    if (!this.user || !this.user.name) return '';

    const nameParts = this.user.name.split(' ');
    return nameParts[0];
  }

  // Get user's initials for avatar placeholder
  getUserInitials(): string {
    if (!this.user || !this.user.name) return '?';

    const nameParts = this.user.name.split(' ');
    let initials = nameParts[0].charAt(0).toUpperCase();

    if (nameParts.length > 1) {
      initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }

    return initials;
  }

  // Get current greeting based on time of day
  getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }

  // Logout method for the sidenav
  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  // Login method for handling login button click in the toolbar
  login(): void {
    this.store.dispatch(AuthActions.loginRequest({}));
  }
}
