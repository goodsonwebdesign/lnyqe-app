import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
  private themeService = inject(ThemeService);
  isDarkMode = false;

  constructor() {
    // Use effect to react to theme changes
    effect(() => {
      this.isDarkMode = this.themeService.isDarkMode();
    });
  }

  ngOnInit(): void {
    // Initialize dark mode status
    this.isDarkMode = this.themeService.isDarkMode();
  }
}
