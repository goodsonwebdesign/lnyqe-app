import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/ui/card/card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dateCreated: Date;
  requestedBy: string;
  assignedTo?: string;
}

@Component({
  selector: 'app-service-requests',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  templateUrl: './service-requests.component.html',
  styleUrls: ['./service-requests.component.scss']
})
export class ServiceRequestsComponent {
  // Sample data for service requests
  serviceRequests: ServiceRequest[] = [
    {
      id: 'SR-001',
      title: 'HVAC Maintenance',
      description: 'Regular maintenance check for HVAC system in Building A',
      status: 'in-progress',
      priority: 'medium',
      dateCreated: new Date('2025-04-29'),
      requestedBy: 'Jane Smith',
      assignedTo: 'Tech Team Alpha'
    },
    {
      id: 'SR-002',
      title: 'Broken Window',
      description: 'Window broken in conference room B on the 3rd floor',
      status: 'new',
      priority: 'high',
      dateCreated: new Date('2025-05-02'),
      requestedBy: 'John Doe'
    },
    {
      id: 'SR-003',
      title: 'Lighting Replacement',
      description: 'Replace burned out lights in parking garage Level 2',
      status: 'new',
      priority: 'low',
      dateCreated: new Date('2025-05-01'),
      requestedBy: 'Mark Johnson'
    },
    {
      id: 'SR-004',
      title: 'Water Leak',
      description: 'Water leaking from ceiling in room 405',
      status: 'in-progress',
      priority: 'urgent',
      dateCreated: new Date('2025-05-03'),
      requestedBy: 'Sarah Williams',
      assignedTo: 'Plumbing Team'
    },
    {
      id: 'SR-005',
      title: 'Network Outage',
      description: 'Internet connectivity issues on the 5th floor',
      status: 'completed',
      priority: 'high',
      dateCreated: new Date('2025-04-25'),
      requestedBy: 'David Chen',
      assignedTo: 'IT Support'
    }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'new':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'in-progress':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'cancelled':
        return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200';
      default:
        return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200';
    }
  }
}
