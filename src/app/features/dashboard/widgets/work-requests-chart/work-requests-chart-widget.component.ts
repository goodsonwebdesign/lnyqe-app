import { Component, input } from '@angular/core';
import { ChartDataPoint } from '../../models/chart-data-point.model';
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
  chartData = input.required<ChartDataPoint[]>();

  // Chart options
  readonly gradient: boolean = true;
  readonly showLegend: boolean = true;
  readonly showLabels: boolean = true;
  readonly isDoughnut: boolean = false;
  readonly legendPosition: LegendPosition = LegendPosition.Below;

  readonly colorScheme: Color = {
    name: 'workRequestsStatus',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };
}

