import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-work-requests-chart-widget',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './work-requests-chart-widget.component.html',
  styleUrls: ['./work-requests-chart-widget.component.scss']
})
export class WorkRequestsChartWidgetComponent {
  // Chart data
  chartData = [
    { name: 'New', value: 15 },
    { name: 'In Progress', value: 8 },
    { name: 'On Hold', value: 3 },
    { name: 'Completed', value: 25 },
  ];

  // Chart options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  legendPosition: LegendPosition = LegendPosition.Below;

  colorScheme: Color = {
    name: 'workRequestsStatus',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
}
