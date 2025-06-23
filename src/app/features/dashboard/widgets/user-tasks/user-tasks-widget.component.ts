import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '@core/models/task.model';

@Component({
  selector: 'app-user-tasks-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-tasks-widget.component.html',
  styleUrls: ['./user-tasks-widget.component.scss'],
})
export class UserTasksWidgetComponent {
  tasks = input.required<Task[]>();
}
