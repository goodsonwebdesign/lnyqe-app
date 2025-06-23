import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Task } from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  getTasks(): Observable<Task[]> {
    // TODO: Connect this to a real API endpoint. The userId will be needed then.
    // Mock data for now
    const mockTasks: Task[] = [
      { id: '1', title: 'Complete user profile', description: 'Fill out all the details in your user profile.', completed: false, dueDate: new Date('2025-07-01') },
      { id: '2', title: 'Verify email address', description: 'Click the verification link sent to your email.', completed: true },
      { id: '3', title: 'Set up two-factor authentication', description: 'Enhance your account security.', completed: false, dueDate: new Date('2025-06-25') },
    ];
    return of(mockTasks);
  }
}
