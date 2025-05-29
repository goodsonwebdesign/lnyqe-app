/**
 * UI Components Collection
 *
 * This file exports common UI components to reduce repetitive imports.
 * For performance optimization, components are exported individually and as an array.
 * - Import individual components when you only need specific ones
 * - Import the UI_COMPONENTS array when you need many components
 */

import { ButtonComponent } from '../button/button.component';
import { CardComponent } from '../card/card.component';
import { ContainerComponent } from '../container/container.component';
import { FlyoutComponent } from '../flyout/flyout.component';
import { IconComponent } from '../icon/icon.component';
import { InputComponent } from '../input/input.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';

// Export individual components (better for tree-shaking)
export { IconComponent } from '../icon/icon.component';
export { ButtonComponent } from '../button/button.component';
export { CardComponent } from '../card/card.component';
export { InputComponent } from '../input/input.component';
export { FlyoutComponent } from '../flyout/flyout.component';
export { SidenavComponent } from '../sidenav/sidenav.component';
export { ContainerComponent } from '../container/container.component';
export { ToolbarComponent } from '../toolbar/toolbar.component';

// Export component array for bulk imports
export const UI_COMPONENTS = [
  IconComponent,
  ButtonComponent,
  CardComponent,
  InputComponent,
  FlyoutComponent,
  SidenavComponent,
  ContainerComponent,
  ToolbarComponent,
];
