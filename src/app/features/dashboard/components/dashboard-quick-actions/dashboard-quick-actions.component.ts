import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionItem } from '../../dashboard.types'; // Adjusted path
import { IconComponent } from '../../../../shared/components/ui/icon/icon.component'; // Adjusted path

@Component({
  selector: 'app-dashboard-quick-actions',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './dashboard-quick-actions.component.html',
  styleUrls: ['./dashboard-quick-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardQuickActionsComponent {
  @Input() quickActions: ActionItem[] = [];
  @Output() actionSelect = new EventEmitter<string>();

  handleActionClick(action: string): void {
    this.actionSelect.emit(action);
  }
}
