import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ContainerComponent } from '../../shared/components/ui/container/container.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';
import { ThemeService } from '../../core/services/theme.service';
import { FlyoutService } from '../../core/services/flyout/flyout.service';
import { catchError, EMPTY } from 'rxjs';
import { ServiceRequestService } from '../../features/service-request/service-request.service';
import { ServiceRequestComponent } from '../../features/service-request/service-request.component';

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
export class MainLayoutComponent implements OnInit {
  currentYear = new Date().getFullYear();
  buildInfo = '';
  deployedOn = '';

  lightModeLogo = 'https://img-lynqe.s3.us-east-2.amazonaws.com/logo-blk.png';
  darkModeLogo = 'https://img-lynqe.s3.us-east-2.amazonaws.com/logo-wht.png';

  themeService = inject(ThemeService);
  private serviceRequestService = inject(ServiceRequestService);
  private flyoutService = inject(FlyoutService);
  private http = inject(HttpClient);

  ngOnInit() {
    // Set a default value first to avoid any issues if the request fails
    this.buildInfo = 'Development Build';

    // Only load build info if not in a problematic URL path
    // This prevents Vite from trying to decode potentially malformed URIs
    if (!window.location.pathname.includes('%') && !window.location.search.includes('%')) {
      this.loadBuildInfo();
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
}
