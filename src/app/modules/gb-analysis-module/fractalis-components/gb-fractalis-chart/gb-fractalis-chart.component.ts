import {Component, Input, OnInit} from '@angular/core';
import {Chart} from '../../../../models/chart-models/chart';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {FractalisService} from '../../../../services/fractalis.service';
import {Concept} from '../../../../models/constraint-models/concept';

@Component({
  selector: 'gb-fractalis-chart',
  templateUrl: './gb-fractalis-chart.component.html',
  styleUrls: ['./gb-fractalis-chart.component.css']
})
export class GbFractalisChartComponent implements OnInit {

  @Input() chart: Chart;

  constructor(private fractalisService: FractalisService) {
  }

  ngOnInit() {
    this.initializeChart();
  }

  initializeChart() {
    // TODO 1: modify fractalis.js so that it is responsive to gridster layout
    // TODO 2: figure out an async detector
    // that detects when the chart div is available to fractalis, ngOnInit is still too early
    this.fractalisService.F.setChart('histogram', '#' + this.chart.id);
    // fractal.getChartParameterDescriptions(this.myChart1, (v) => {
    //   console.log('v', v)
    //   // fractal.setChartParameters(myChart1, v);
    // });
  }

  get ChartType() {
    return ChartType;
  }
}
