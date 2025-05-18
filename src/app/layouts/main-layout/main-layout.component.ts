import { Component, OnInit, inject, ChangeDetectionStrategy, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { ThemeService } from '../../core/services/theme.service';
import { FlyoutService } from '../../core/services/flyout/flyout.service';
import { catchError, EMPTY, Subscription } from 'rxjs';
import { ServiceRequestService } from '../../features/service-request/service-request.service';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/selectors/auth.selectors';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FlyoutPosition } from '../../shared/components/ui/toolbar/toolbar.component';
import { ServiceRequestComponent } from '../../features/service-request/service-request.component';
import { UI_COMPONENTS } from '../../shared/components/ui';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  requiredRole?: string;
  exact?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ...UI_COMPONENTS,
    ServiceRequestComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  buildInfo = '';
  deployedOn = '';
  isLoggedIn = false;
  user: any = null;

  // Sidenav state
  isSidenavOpen = false; // Always closed by default
  isMobileView = window.innerWidth < 1024;

  // Navigation items with Iconify icon names
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'mdi:home'
    },
    {
      label: 'Service Requests',
      route: '/features/service-requests',
      icon: 'mdi:file-document-outline'
    },
    {
      label: 'Calendar',
      route: '/calendar',
      icon: 'mdi:calendar'
    },
    {
      label: 'Analytics',
      route: '/analytics',
      icon: 'mdi:chart-bar'
    }
  ];

  // Primary Navigation for the horizontal tabs in desktop view
  primaryNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'mdi:home',
      exact: true
    },
    {
      label: 'Requests',
      route: '/features/service-requests',
      icon: 'mdi:file-document-outline'
    },
    {
      label: 'Analytics',
      route: '/analytics',
      icon: 'mdi:chart-bar'
    }
  ];

  // Current route for active state calculations
  currentRoute: string = '';

  private subscriptions = new Subscription();
  private store = inject(Store);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  lightModeLogo = 'https://img-lynqe.s3.us-east-2.amazonaws.com/logo-blk.png';
  darkModeLogo = 'https://img-lynqe.s3.us-east-2.amazonaws.com/logo-wht.png';

  themeService = inject(ThemeService);
  private serviceRequestService = inject(ServiceRequestService);
  private flyoutService = inject(FlyoutService);
  private http = inject(HttpClient);

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
      this.store.select(selectIsAuthenticated).subscribe(isAuthenticated => {
        this.isLoggedIn = isAuthenticated;
        // Removed auto-open sidenav behavior to keep it always closed by default
        this.cdr.markForCheck();
      })
    );

    // Subscribe to user data
    this.subscriptions.add(
      this.store.select(selectCurrentUser).subscribe(user => {
        this.user = user;
        this.cdr.markForCheck();
      })
    );

    // Track current route for active state calculations and close sidenav on navigation
    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          // Close sidenav when navigating to a new page
          this.closeSidenav();

          this.currentRoute = event.urlAfterRedirects;
          this.cdr.markForCheck();
        })
    );

    // Initial check for mobile view
    this.handleResize();

    // Set current route initially
    this.currentRoute = this.router.url;
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when component is destroyed
    this.subscriptions.unsubscribe();
  }

  // Toggle sidenav
  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
    this.cdr.markForCheck();
  }

  // Close sidenav (useful for mobile after navigation)
  closeSidenav(): void {
    // Close the sidenav regardless of screen size
    this.isSidenavOpen = false;
    this.cdr.markForCheck();
  }

  // Added method to check if viewport is desktop
  isDesktopView(): boolean {
    return !this.isMobileView;
  }

  // Check if a route is active (for custom styling)
  isActiveRoute(route: string): boolean {
    if (route === '/') {
      return this.currentRoute === '/';
    }
    return this.currentRoute.startsWith(route);
  }

  // Handle window resize
  private handleResize(): void {
    const wasDesktop = !this.isMobileView;
    this.isMobileView = window.innerWidth < 1024;

    // Auto-close sidenav on mobile when resizing down
    if (this.isMobileView && wasDesktop) {
      this.isSidenavOpen = false;
    }

    // Removed the auto-open behavior for desktop to keep sidenav closed by default

    this.cdr.markForCheck();
  }

  private loadBuildInfo() {
    try {
      // Avoid URL parameters completely to prevent URI decoding issues
      const safePath = 'build-info.txt';

      this.http.get(safePath, {
        responseType: 'text',
        // Use headers instead of URL parameters
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      .pipe(
        catchError(error => {
          console.error('Error loading build info:', error);
          this.buildInfo = 'Development Build';
          return EMPTY;
        })
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
        }
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
    console.log('Opening service request flyout with position:', position);
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
    this.closeSidenav();
    this.authService.logout();
  }

  // Login method for handling login button click in the toolbar
  login(): void {
    console.log('Login button clicked, redirecting to Auth0 login');
    this.authService.login();
  }
}
