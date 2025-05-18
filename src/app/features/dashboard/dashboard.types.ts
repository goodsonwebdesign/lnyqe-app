// Types for the dashboard components
export type SectionType = 'overview' | 'tasks' | 'schedule' | 'admin';

export interface ActionItem {
  icon?: string; // Now optional
  iconName: string; // Now required
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'neutral'; // Styling variant
}

export interface StatCard {
  title: string;
  value: string;
  icon?: string; // Now optional
  iconName: string; // Now required
  iconBg: string;
  iconColor: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  info?: string;
}

export interface Task {
  title: string;
  date: string;
  status: 'urgent' | 'pending' | 'in-progress' | 'completed';
  icon?: string; // Now optional
  iconName: string; // Now required
  iconBg: string;
  iconColor: string;
}

export interface ScheduleItem {
  title: string;
  location: string;
  time: string;
  duration: string;
  attendees: {
    initials: string;
    color: string;
  }[];
}

export interface Notification {
  message: string;
  time: string;
  type: 'message' | 'success' | 'warning' | 'alert';
}

export interface SystemStatus {
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'warning';
}

// ViewModel for the dashboard component
export interface DashboardViewModel {
  user: any;
  userRole: string;
  activeSection: SectionType;
  quickActions: ActionItem[];
  adminActions: ActionItem[];
  statCards: StatCard[];
  tasks: Task[];
  scheduleItems: ScheduleItem[];
  notifications: Notification[];
  systemStatuses: SystemStatus[];
}
