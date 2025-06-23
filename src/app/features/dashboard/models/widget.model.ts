import { GridsterItem } from 'angular-gridster2';

// Extend GridsterItem to include our custom properties for type safety
export interface WidgetGridsterItem extends GridsterItem {
  title: string;
  component: string;
}
