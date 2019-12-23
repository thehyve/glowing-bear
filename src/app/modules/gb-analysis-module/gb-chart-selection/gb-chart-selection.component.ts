import {Component, OnInit} from '@angular/core';
import {ChartType} from '../../../models/chart-models/chart-type';
import {ChartService} from '../../../services/chart.service';

@Component({
  selector: 'gb-chart-selection',
  templateUrl: './gb-chart-selection.component.html',
  styleUrls: ['./gb-chart-selection.component.css']
})
export class GbChartSelectionComponent implements OnInit {

  chartTypes: Array<string>;

  constructor(private chartService: ChartService) {
    this.chartTypes = Object.keys(ChartType);
    this.chartService.chartSelected = null;
  }

  ngOnInit() {
  }

  selectChartType(chartType: string) {
    this.chartService.chartSelected = ChartType[chartType];
    console.log("Chart selected: " + ChartType[chartType]);
    this.chartService.isChartEditingMode = false;
  }

}
