import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HomeFeature } from './home.types';
import { UI_COMPONENTS } from '../../shared/components/ui';

interface Update {
  category: string;
  date: string;
  title: string;
  summary: string;
}

interface Testimonial {
  quote: string;
  name: string;
  position: string;
  initials: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...UI_COMPONENTS],
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

  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onEnterpriseLogin(): void {
    this.navigateToEnterpriseLogin.emit();
  }
}
