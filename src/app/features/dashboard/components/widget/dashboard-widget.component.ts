import { Component, EventEmitter, Output, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetGridsterItem } from '../../models/widget.model';

@Component({
  selector: 'app-dashboard-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardWidgetComponent {
  item = input.required<WidgetGridsterItem>();
  @Output() closeWidget = new EventEmitter<WidgetGridsterItem>();

  get title(): string {
    return this.item()?.title || 'Widget';
  }

  get titleId(): string {
    // Create a unique ID for the title, using the component name from the gridster item.
    const componentName = this.item()?.component || 'default';
    return `widget-title-${componentName}`;
  }

  onCloseClicked(event: MouseEvent | TouchEvent): void {
    // Prevent the drag event from firing when clicking the button
    event.preventDefault();
    event.stopPropagation();
    this.closeWidget.emit(this.item());
  }
}

