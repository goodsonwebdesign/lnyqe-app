import { Component } from '@angular/core';
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
  ],
  templateUrl: './dashboard-widgets.component.html',
  styleUrls: ['./dashboard-widgets.component.scss']
})
export class DashboardWidgetsComponent {

}
