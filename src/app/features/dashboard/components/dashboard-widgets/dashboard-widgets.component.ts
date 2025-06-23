import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { UserTasksWidgetComponent } from '../../widgets/user-tasks/user-tasks-widget.component';
import { RecentMessagesWidgetComponent } from '../../widgets/recent-messages/recent-messages-widget.component';
import { WorkRequestsChartWidgetComponent } from '../../widgets/work-requests-chart/work-requests-chart-widget.component';

@Component({
  selector: 'app-dashboard-widgets',
  standalone: true,
  imports: [
    UserTasksWidgetComponent,
    RecentMessagesWidgetComponent,
    WorkRequestsChartWidgetComponent,
    AsyncPipe,

  ],
  templateUrl: './dashboard-widgets.component.html',
  styleUrls: ['./dashboard-widgets.component.scss']
})
export class DashboardWidgetsComponent {
  private readonly dashboardService = inject(DashboardService);

  readonly tasks$ = this.dashboardService.getUserTasks();
  readonly messages$ = this.dashboardService.getRecentMessages();
  readonly chartData$ = this.dashboardService.getWorkRequestsChartData();
}

