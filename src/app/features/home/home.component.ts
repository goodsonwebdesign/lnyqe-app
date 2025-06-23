import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeFeature, Update, Testimonial } from './home.types';
import { UI_COMPONENTS } from '../../shared/components/ui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ...UI_COMPONENTS],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() features: HomeFeature[] = [];
  @Input() latestUpdates: Update[] = [];
  @Input() testimonials: Testimonial[] = [];
  @Input() currentTime = '';
  @Input() isLoading = false;

  @Output() navigateToEnterpriseLogin = new EventEmitter<void>();

  onEnterpriseLogin(): void {
    this.navigateToEnterpriseLogin.emit();
  }
}
