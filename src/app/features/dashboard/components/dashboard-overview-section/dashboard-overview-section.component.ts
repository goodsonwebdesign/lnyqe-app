import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { StatCard, Task, ScheduleItem, Notification, SystemStatus, ActionItem } from '../../dashboard.types';
import { UI_COMPONENTS } from '@shared/components/ui';

@Component({
  selector: 'app-dashboard-overview-section',
  standalone: true,
  imports: [CommonModule, ...UI_COMPONENTS, TitleCasePipe],
  templateUrl: './dashboard-overview-section.component.html',
  styleUrls: ['./dashboard-overview-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOverviewSectionComponent {
  @Input() statCards: StatCard[] = [];
  @Input() tasks: Task[] = [];
  @Input() scheduleItems: ScheduleItem[] = [];
  @Input() notifications: Notification[] = [];
  @Input() systemStatuses: SystemStatus[] = [];

  // Helper function inputs - these might be simplified or handled differently later
  @Input() getStatusClass!: (status: string) => string;
  @Input() getNotificationIconName!: (type: string) => string;
  @Input() getNotificationIconBg!: (type: string) => string;
  @Input() getNotificationIconColor!: (type: string) => string;

  @Output() viewAllTasks = new EventEmitter<void>();
  @Output() viewFullSchedule = new EventEmitter<void>();
  @Output() createTask = new EventEmitter<void>();
  @Output() addEvent = new EventEmitter<void>();
  @Output() viewAllNotifications = new EventEmitter<void>(); // Placeholder for future use
  @Output() viewSystemDetails = new EventEmitter<void>(); // Placeholder for future use

  // To manage titles like 'Recent Tasks' vs 'All Tasks' if needed internally, or pass as input
  // For now, this component will display what it's given, assuming 'preview' context
}
