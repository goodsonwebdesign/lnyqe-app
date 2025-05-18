import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from '../../theme-toggle/theme-toggle.component';
import { UserMenuComponent } from '../../user-menu/user-menu.component';
import { ThemeService } from '../../../../core/services/theme.service';
import { IconComponent } from '../icon/icon.component';

export type FlyoutPosition = 'right' | 'left' | 'bottom';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent, UserMenuComponent, IconComponent],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  themeService = inject(ThemeService);
  
  @Input() isLoggedIn = false;
  @Input() isSidenavOpen = false;
  @Input() lightModeLogo = '';
  @Input() darkModeLogo = '';
  @Input() userName = '';
  @Input() userInitials = '';
  @Input() greeting = '';

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() openServiceRequest = new EventEmitter<FlyoutPosition>();
  @Output() login = new EventEmitter<void>(); // Added login output emitter
  
  // A helper method to handle service request button click
  onOpenServiceRequest(position: FlyoutPosition): void {
    this.openServiceRequest.emit(position);
  }
  
  // Helper for dark mode check
  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
