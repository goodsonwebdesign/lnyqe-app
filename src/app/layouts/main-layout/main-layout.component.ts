import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ContainerComponent } from '../../shared/components/ui/container/container.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ContainerComponent, ThemeToggleComponent, UserMenuComponent, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  currentYear = new Date().getFullYear();
  themeService = inject(ThemeService);
  private http = inject(HttpClient);
  
  buildInfo: string = 'Loading...';
  deployedOn: string = '';

  // Replace these URLs with your actual S3 bucket image URLs
  lightModeLogo = 'https://img-lynqe.s3.us-east-2.amazonaws.com/logo-blk.png';
  darkModeLogo = 'https://img-lynqe.s3.us-east-2.amazonaws.com/logo-wht.png';
  
  ngOnInit() {
    this.loadBuildInfo();
  }
  
  private loadBuildInfo() {
    // Add random query parameter to prevent caching
    const noCacheParam = `?nocache=${new Date().getTime()}`;
    
    this.http.get(`/build-info.txt${noCacheParam}`, { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.buildInfo = data.trim();
          // Extract timestamp from the build info if possible
          if (data.includes('Build date:')) {
            const dateStr = data.replace('Build date:', '').trim();
            this.deployedOn = this.formatDate(dateStr);
          }
        },
        error: () => {
          this.buildInfo = 'Unknown';
        }
      });
  }
  
  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  }
}
