import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recent-messages-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-messages-widget.component.html',
  styleUrls: ['./recent-messages-widget.component.scss']
})
export class RecentMessagesWidgetComponent {
  messages = [
    { from: 'Jane Smith', subject: 'Re: Project Update', time: '10:42 AM' },
    { from: 'Maintenance Team', subject: 'Scheduled Downtime', time: 'Yesterday' },
    { from: 'HR Department', subject: 'Open Enrollment Reminder', time: '2 days ago' },
  ];
}
