import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RibbonTab } from '../../models/ribbon.model';
import { ribbonTabs } from '../../config/ribbon.config';

@Component({
  selector: 'app-ribbon',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ribbon.component.html',
  styleUrls: ['./ribbon.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RibbonComponent {
  activeTab = 'home';
  readonly tabs: RibbonTab[] = ribbonTabs;

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }
}

