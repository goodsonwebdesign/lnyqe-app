import { Component, OnInit, inject, ChangeDetectionStrategy, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { ContainerComponent } from '../../shared/components/ui/container/container.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';
import { ThemeService } from '../../core/services/theme.service';
import { FlyoutService } from '../../core/services/flyout/flyout.service';
import { catchError, EMPTY, Subscription } from 'rxjs';
import { ServiceRequestService } from '../../features/service-request/service-request.service';
import { ServiceRequestComponent } from '../../features/service-request/service-request.component';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/selectors/auth.selectors';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  requiredRole?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ContainerComponent,
    ThemeToggleComponent,
    UserMenuComponent,
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
  isSidenavOpen = false;
  isMobileView = window.innerWidth < 1024;

  // Navigation items
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      label: 'Service Requests',
      route: '/features/service-requests',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    }
  ];

  private subscriptions = new Subscription();
  private store = inject(Store);

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
      })
    );

    // Subscribe to user data
    this.subscriptions.add(
      this.store.select(selectCurrentUser).subscribe(user => {
        this.user = user;
      })
    );

    // Initial check for mobile view
    this.handleResize();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when component is destroyed
    this.subscriptions.unsubscribe();
  }

  // Toggle sidenav
  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  // Close sidenav (useful for mobile after navigation)
  closeSidenav(): void {
    if (this.isMobileView) {
      this.isSidenavOpen = false;
    }
  }

  // Handle window resize
  private handleResize(): void {
    this.isMobileView = window.innerWidth < 1024;
    // Auto-close sidenav on mobile when resizing down
    if (this.isMobileView && this.isSidenavOpen) {
      this.isSidenavOpen = false;
    }
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

  openServiceRequestFlyout(position: 'right' | 'left' | 'bottom' = 'right'): void {
    console.log('Opening service request flyout with position:', position);
    this.serviceRequestService.openServiceRequest(position);
  }

  // Get user's first name for greeting
  getUserFirstName(): string {
    if (!this.user || !this.user.name) return '';

    const nameParts = this.user.name.split(' ');
    return nameParts[0];
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
}
