import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  HostListener,
  OnInit,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsAuthenticated } from '../../../../store/selectors/auth.selectors';
import { ThemeToggleComponent } from '../../theme-toggle/theme-toggle.component';
import { UserMenuComponent } from '../../user-menu/user-menu.component';
import { ThemeService } from '../../../../core/services/theme.service';
import { IconComponent } from '../icon/icon.component';

export type FlyoutPosition = 'right' | 'left' | 'bottom';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    RouterModule,
    ThemeToggleComponent,
    UserMenuComponent,
    IconComponent
  ],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  themeService = inject(ThemeService);
  private store = inject(Store);
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input() lightModeLogo = '';
  @Input() darkModeLogo = '';

  @Output() openServiceRequest = new EventEmitter<FlyoutPosition>();
  @Output() login = new EventEmitter<void>(); // Added login output emitter

    isLoggedIn$: Observable<boolean> = this.store.select(selectIsAuthenticated);

  // Initialize scroll state
  private scrollThreshold = 10;
  isScrolled = false;

  ngOnInit(): void {
    // Check initial scroll position when component initializes
    this.checkScroll();
  }

  // Listen for scroll events
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  // Helper method to check scroll position and update component state
  private checkScroll(): void {
    const scrollPosition =
      window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const wasScrolled = this.isScrolled;
    this.isScrolled = scrollPosition > this.scrollThreshold;

    // Only apply class changes if state changed to avoid unnecessary DOM updates
    if (wasScrolled !== this.isScrolled) {
      if (this.isScrolled) {
        this.renderer.addClass(this.elementRef.nativeElement, 'scrolled');
      } else {
        this.renderer.removeClass(this.elementRef.nativeElement, 'scrolled');
      }
    }
  }

  // A helper method to handle service request button click
  onOpenServiceRequest(position: FlyoutPosition): void {
    this.openServiceRequest.emit(position);
  }
}
