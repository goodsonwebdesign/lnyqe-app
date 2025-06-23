import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { HomeViewModel } from './home.types';
import { Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { HOME_VIEW_MODEL, LATEST_UPDATES, TESTIMONIALS } from './home.data';

@Component({
  selector: 'app-home-container',
  standalone: true,
  imports: [CommonModule, HomeComponent],
  template: `
    <app-home
      [title]="homeViewModel.title"
      [subtitle]="homeViewModel.subtitle"
      [features]="homeViewModel.features"
      [latestUpdates]="latestUpdates"
      [testimonials]="testimonials"
      [currentTime]="currentTime"
      [isLoading]="homeViewModel.isLoading"
      (navigateToEnterpriseLogin)="navigateToEnterpriseLogin()"
    >
    </app-home>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeContainerComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private subscription = new Subscription();

  currentTime = '';

  homeViewModel: HomeViewModel = HOME_VIEW_MODEL;
  latestUpdates = LATEST_UPDATES;
  testimonials = TESTIMONIALS;

  ngOnInit(): void {
    // Initialize the current time immediately
    this.updateCurrentTime();

    // Update time every minute using observable pattern
    this.subscription.add(
      interval(60000)
        .pipe(map(() => this.updateCurrentTime()))
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`;
    this.currentTime = timeString;

    // Explicitly trigger change detection since we're using OnPush
    this.cdr.markForCheck();

    return timeString;
  }

  // Navigate to the enterprise SSO login page
  navigateToEnterpriseLogin(): void {
    this.router.navigate(['/enterprise-login']);
  }
}
