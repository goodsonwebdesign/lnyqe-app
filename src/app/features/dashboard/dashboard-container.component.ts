import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RibbonComponent } from './components/ribbon/ribbon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RibbonComponent
  ],
  templateUrl: './dashboard-container.component.html',
  styleUrls: ['./dashboard-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainerComponent {

}
