import { Component, EventEmitter, Input, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterItem } from 'angular-gridster2';

@Component({
  selector: 'app-dashboard-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-widget.component.html',
    styleUrls: ['./dashboard-widget.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardWidgetComponent {
  get titleId(): string {
    // Create a unique ID for the title, using the component name from the gridster item.
    const componentName = this.item && this.item['component'] ? this.item['component'] : 'default';
    return `widget-title-${componentName}`;
  }

  @Input() item!: GridsterItem;
    @Output() close = new EventEmitter<GridsterItem>();

  getWidgetTitle(): string {
    return this.item ? (this.item['title'] as string) : 'Widget';
  }

  onCloseClicked(): void {
    this.close.emit(this.item);
  }

  // A helper to safely access properties that might come from an index signature
  get title(): string {
    return this.item && this.item['title'] ? this.item['title'] : 'Widget';
  }

  onClose(event: MouseEvent | TouchEvent): void {
    // Prevent the drag event from firing when clicking the button
    event.preventDefault();
    event.stopPropagation();
    this.close.emit(this.item);
  }
}
