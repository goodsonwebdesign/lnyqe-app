import { SelectOption } from './service-request.models';

export const REQUEST_TYPES: readonly SelectOption[] = [
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'IT Support', value: 'it-support' },
  { label: 'Facilities', value: 'facilities' },
  { label: 'Security', value: 'security' },
  { label: 'Other', value: 'other' },
];

export const PRIORITIES: readonly SelectOption[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

export const DEPARTMENTS: readonly SelectOption[] = [
  { label: 'Administration', value: 'administration' },
  { label: 'HR', value: 'hr' },
  { label: 'IT', value: 'it' },
  { label: 'Finance', value: 'finance' },
  { label: 'Operations', value: 'operations' },
  { label: 'Sales', value: 'sales' },
  { label: 'Marketing', value: 'marketing' },
];
