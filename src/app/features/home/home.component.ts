import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/components/ui/card/card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';

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
  imports: [
    CommonModule,
    CardComponent,
    ButtonComponent,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  form!: FormGroup;
  currentTime!: string;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Set initial time
    this.updateCurrentTime();

    // Update time every minute
    setInterval(() => {
      this.updateCurrentTime();
    }, 60000);
  }

  updateCurrentTime(): void {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    this.currentTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  // Latest updates data - using current date (April 29, 2025)
  latestUpdates: Update[] = [
    {
      category: 'New Feature',
      date: 'April 27, 2025',
      title: 'AI-Powered Predictive Maintenance',
      summary: 'Our new predictive maintenance algorithm identifies potential equipment issues before they cause downtime, reducing facility disruptions by up to 75%.'
    },
    {
      category: 'Enhancement',
      date: 'April 20, 2025',
      title: 'Advanced Space Optimization',
      summary: 'The latest update to our space management tools uses AI to analyze occupancy patterns and automatically suggest optimal office layouts and resource allocation.'
    },
    {
      category: 'Integration',
      date: 'April 15, 2025',
      title: 'Smart Building IoT Integration',
      summary: 'Connect with over 200 different IoT sensors and systems to create a unified building management ecosystem with centralized monitoring and automation.'
    }
  ];

  // Testimonials data
  testimonials: Testimonial[] = [
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
}
