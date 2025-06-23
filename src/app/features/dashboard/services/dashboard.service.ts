import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Task } from '../models/task.model';
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
    { id: 1, text: 'Review new design mockups', completed: false },
    { id: 2, text: 'Update user authentication flow', completed: false },
    { id: 3, text: 'Fix bug #1234', completed: true },
  ];

  private mockMessages: Message[] = [
    { from: 'Alice', subject: 'Project Update', time: '2 hours ago' },
    { from: 'Bob', subject: 'Weekly Report', time: '1 day ago' },
    { from: 'Charlie', subject: 'Quick Question', time: '3 days ago' },
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
