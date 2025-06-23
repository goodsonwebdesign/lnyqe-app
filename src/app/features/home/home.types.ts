// Types for home components
export interface HomeViewModel {
  title: string;
  subtitle: string;
  features: HomeFeature[];
  isLoading: boolean;
}

export interface HomeFeature {
  title: string;
  description: string;
  icon?: string; // Now optional
  iconName: string; // Now required
  route: string;
}

export interface Update {
  category: string;
  date: string;
  title: string;
  summary: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  position: string;
  initials: string;
}
