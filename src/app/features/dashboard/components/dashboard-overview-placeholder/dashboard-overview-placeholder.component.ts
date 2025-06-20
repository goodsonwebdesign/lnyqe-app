import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; // For @for

@Component({
  selector: 'app-dashboard-overview-placeholder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-overview-placeholder.component.html',
  styleUrls: ['./dashboard-overview-placeholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOverviewPlaceholderComponent {}
