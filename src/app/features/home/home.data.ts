import { HomeViewModel } from './home.types';

export const HOME_VIEW_MODEL: HomeViewModel = {
  title: 'Welcome to LNYQE',
  subtitle: 'The Next Generation Facility Management Platform',
  features: [
    {
      title: 'Smart Facilities Management',
      description:
        'AI-powered maintenance scheduling, resource optimization, and predictive analytics',
      iconName: 'mdi:server',
      route: '/dashboard',
    },
    {
      title: 'Resource Scheduling',
      description: 'Centralized management of conference rooms, equipment, and shared resources',
      iconName: 'mdi:calendar',
      route: '/schedule',
    },
    {
      title: 'Service Request Management',
      description: 'Streamlined request intake, routing, and fulfillment tracking',
      iconName: 'mdi:clipboard-text',
      route: '/service-requests',
    },
  ],
  isLoading: false,
};

export const LATEST_UPDATES = [
  {
    category: 'New Feature',
    date: 'May 15, 2025',
    title: 'AI-Powered Predictive Maintenance',
    summary:
      'Our new predictive maintenance algorithm identifies potential equipment issues before they cause downtime, reducing facility disruptions by up to 75%.',
  },
  {
    category: 'Enhancement',
    date: 'May 10, 2025',
    title: 'Advanced Space Optimization',
    summary:
      'The latest update to our space management tools uses AI to analyze occupancy patterns and automatically suggest optimal office layouts and resource allocation.',
  },
  {
    category: 'Integration',
    date: 'May 5, 2025',
    title: 'Smart Building IoT Integration',
    summary:
      'Connect with over 200 different IoT sensors and systems to create a unified building management ecosystem with centralized monitoring and automation.',
  },
];

export const TESTIMONIALS = [
  {
    quote:
      'LNYQE has revolutionized how we manage our 25-story office complex. Our maintenance response times are down 45% and tenant satisfaction scores have increased by 38% in just three months.',
    name: 'Robert Townsend',
    position: 'Facilities Director, Horizon Properties',
    initials: 'RT',
  },
  {
    quote:
      'The automated key management system alone saved us hundreds of hours annually. The AI scheduling has virtually eliminated double-bookings and resource conflicts across our 12 conference centers.',
    name: 'Jennifer Liu',
    position: 'Operations Manager, Global Facilities Inc.',
    initials: 'JL',
  },
];
