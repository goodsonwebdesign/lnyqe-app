import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { HomeFeature, HomeViewModel } from './home.types';
import { Subscription, interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-home-container',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HomeComponent],
  template: `
    <app-home
      [title]="homeViewModel.title"
      [subtitle]="homeViewModel.subtitle"
      [features]="homeViewModel.features"
      [latestUpdates]="latestUpdates"
      [testimonials]="testimonials"
      [currentTime]="currentTime"
      [isLoading]="homeViewModel.isLoading"
      (navigateToEnterpriseLogin)="navigateToEnterpriseLogin()">
    </app-home>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeContainerComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private subscription = new Subscription();

  currentTime = '';

  homeViewModel: HomeViewModel = {
    title: 'Welcome to LNYQE',
    subtitle: 'The Next Generation Facility Management Platform',
    features: [
      {
        title: 'Smart Facilities Management',
        description: 'AI-powered maintenance scheduling, resource optimization, and predictive analytics',
        iconName: 'mdi:server',
        route: '/dashboard'
      },
      {
        title: 'Resource Scheduling',
        description: 'Centralized management of conference rooms, equipment, and shared resources',
        iconName: 'mdi:calendar',
        route: '/schedule'
      },
      {
        title: 'Service Request Management',
        description: 'Streamlined request intake, routing, and fulfillment tracking',
        iconName: 'mdi:clipboard-text',
        route: '/service-requests'
      }
    ],
    isLoading: false
  };

  // Latest updates data - using current date (May 17, 2025)
  latestUpdates = [
    {
      category: 'New Feature',
      date: 'May 15, 2025',
      title: 'AI-Powered Predictive Maintenance',
      summary: 'Our new predictive maintenance algorithm identifies potential equipment issues before they cause downtime, reducing facility disruptions by up to 75%.'
    },
    {
      category: 'Enhancement',
      date: 'May 10, 2025',
      title: 'Advanced Space Optimization',
      summary: 'The latest update to our space management tools uses AI to analyze occupancy patterns and automatically suggest optimal office layouts and resource allocation.'
    },
    {
      category: 'Integration',
      date: 'May 5, 2025',
      title: 'Smart Building IoT Integration',
      summary: 'Connect with over 200 different IoT sensors and systems to create a unified building management ecosystem with centralized monitoring and automation.'
    }
  ];

  // Testimonials data
  testimonials = [
    {
      quote: 'LNYQE has revolutionized how we manage our 25-story office complex. Our maintenance response times are down 45% and tenant satisfaction scores have increased by 38% in just three months.',
      name: 'Robert Townsend',
      position: 'Facilities Director, Horizon Properties',
      initials: 'RT'
    },
    {
      quote: 'The automated key management system alone saved us hundreds of hours annually. The AI scheduling has virtually eliminated double-bookings and resource conflicts across our 12 conference centers.',
      name: 'Jennifer Liu',
      position: 'Operations Manager, Global Facilities Inc.',
      initials: 'JL'
    }
  ];

  ngOnInit(): void {
    // Initialize the current time immediately
    this.updateCurrentTime();

    // Update time every minute using observable pattern
    this.subscription.add(
      interval(60000).pipe(
        map(() => this.updateCurrentTime())
      ).subscribe()
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
