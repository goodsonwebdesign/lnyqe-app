import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-tasks-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-tasks-widget.component.html',
  styleUrls: ['./user-tasks-widget.component.scss']
})
export class UserTasksWidgetComponent {
  tasks = [
    { id: 1, text: 'Review new vendor applications', completed: false },
    { id: 2, text: 'Approve pending work requests', completed: false },
    { id: 3, text: 'Follow up with @JohnDoe on project status', completed: true },
  ];
}
