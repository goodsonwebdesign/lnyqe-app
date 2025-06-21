import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Define interfaces for our ribbon structure
interface RibbonAction {
  id:string;
  label: string;
  icon: string; // For an icon library like Iconify
  route?: string;
}

interface RibbonGroup {
  id: string;
  title: string;
  actions: RibbonAction[];
}

interface RibbonTab {
  id: string;
  title: string;
  groups: RibbonGroup[];
}

@Component({
  selector: 'app-ribbon',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ribbon.component.html',
  styleUrls: ['./ribbon.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RibbonComponent {
  activeTab: string = 'home';

  tabs: RibbonTab[] = [
    {
      id: 'home',
      title: 'Home',
      groups: [
        {
          id: 'new',
          title: 'New',
          actions: [
            { id: 'new-request', label: 'Work Request', icon: 'mdi:file-document-plus-outline' },
            { id: 'new-message', label: 'Message', icon: 'mdi:message-plus-outline' },
          ]
        },
        {
          id: 'view',
          title: 'View',
          actions: [
            { id: 'view-dashboard', label: 'Dashboard', icon: 'mdi:view-dashboard-outline', route: '/dashboard' },
            { id: 'view-calendar', label: 'Calendar', icon: 'mdi:calendar-month-outline' },
            { id: 'view-tasks', label: 'Tasks', icon: 'mdi:check-circle-outline' },
          ]
        },
        {
          id: 'manage',
          title: 'Manage',
          actions: [
            { id: 'manage-users', label: 'Users', icon: 'mdi:account-group-outline', route: '/dashboard/users' },
            { id: 'manage-vendors', label: 'Vendors', icon: 'mdi:storefront-outline' },
            { id: 'manage-requests', label: 'Requests', icon: 'mdi:briefcase-check-outline', route: '/dashboard/requests' },
          ]
        }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      groups: [
        {
          id: 'profile',
          title: 'Profile',
          actions: [
            { id: 'edit-profile', label: 'Edit Profile', icon: 'mdi:account-edit-outline' },
          ]
        }
      ]
    }
  ];

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }
}
