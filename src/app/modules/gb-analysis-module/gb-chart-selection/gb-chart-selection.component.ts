import {Component, OnInit} from '@angular/core';
import {ChartType} from '../../../models/chart-models/chart-type';
import {ChartService} from '../../../services/chart.service';
import {FractalisService} from '../../../services/fractalis.service';

@Component({
  selector: 'gb-chart-selection',
  templateUrl: './gb-chart-selection.component.html',
  styleUrls: ['./gb-chart-selection.component.css']
})
export class GbChartSelectionComponent implements OnInit {

  chartTypes: Array<string>;

  constructor(private chartService: ChartService,
              private fractalisService: FractalisService) {
    if (this.fractalisService.isFractalisEnabled) {
      this.chartTypes = Object.keys(ChartType);
    } else {
      this.chartTypes = [ChartType.CROSSTABLE];
    }
  }

  ngOnInit() {
  }

  selectChartType(chartType: string) {
    this.chartService.createNewChart(ChartType[chartType]);
    this.chartService.isChartSelectionMode = false;
  }

  get isChartSelection(): boolean {
    return this.chartService.isChartSelectionMode;
  }

  set isChartSelection(value: boolean) {
    this.chartService.isChartSelectionMode = value;
  }
}
