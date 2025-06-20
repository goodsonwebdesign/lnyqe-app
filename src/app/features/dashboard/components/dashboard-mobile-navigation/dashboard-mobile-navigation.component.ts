import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { SectionType } from '../../dashboard.types';

export interface NavigationSection {
  key: SectionType;
  label: string;
  requiresAdmin?: boolean;
}

@Component({
  selector: 'app-dashboard-mobile-navigation',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './dashboard-mobile-navigation.component.html',
  styleUrls: ['./dashboard-mobile-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardMobileNavigationComponent {
  @Input() activeSection: string = '';
  @Input() userRole: string = '';
  @Input() sections: NavigationSection[] = [];

  @Output() sectionSelect = new EventEmitter<SectionType>();

  onSectionClick(sectionKey: SectionType): void {
    this.sectionSelect.emit(sectionKey);
  }

  isSectionVisible(section: NavigationSection): boolean {
    if (section.requiresAdmin) {
      return this.userRole === 'admin';
    }
    return true;
  }
}
