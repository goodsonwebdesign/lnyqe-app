import { RibbonTab } from '../models/ribbon.model';

export const ribbonTabs: RibbonTab[] = [
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
