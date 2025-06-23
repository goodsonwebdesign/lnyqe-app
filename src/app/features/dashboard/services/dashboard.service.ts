import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Task } from '../../../core/models/task.model';
import { Message } from '../models/message.model';
import { ChartDataPoint } from '../models/chart-data-point.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/dashboard';

  // Mock data for now
    private mockTasks: Task[] = [
    { id: '1', title: 'Review new design mockups', description: 'Detailed review of the latest wireframes.', completed: false },
    { id: '2', title: 'Update user authentication flow', description: 'Implement MFA.', completed: false },
    { id: '3', title: 'Fix bug #1234', description: 'Fix critical login issue on Safari.', completed: true },
  ];

    private mockMessages: Message[] = [
    { id: '1', from: 'Alice', subject: 'Project Update', time: '2 hours ago' },
    { id: '2', from: 'Bob', subject: 'Weekly Report', time: '1 day ago' },
    { id: '3', from: 'Charlie', subject: 'Quick Question', time: '3 days ago' },
  ];

  private mockChartData: ChartDataPoint[] = [
    { name: 'New', value: 120 },
    { name: 'In Progress', value: 80 },
    { name: 'Completed', value: 200 },
    { name: 'On Hold', value: 30 },
  ];

  getUserTasks(): Observable<Task[]> {
    // In the future, this will be an HTTP call
    return of(this.mockTasks);
  }

  getRecentMessages(): Observable<Message[]> {
    return of(this.mockMessages);
  }

  getWorkRequestsChartData(): Observable<ChartDataPoint[]> {
    return of(this.mockChartData);
  }
}
