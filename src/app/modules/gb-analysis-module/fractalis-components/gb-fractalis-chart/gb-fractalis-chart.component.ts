import {Component, Input, OnInit} from '@angular/core';
import {Chart} from '../../../../models/chart-models/chart';
import {ChartType} from '../../../../models/chart-models/chart-type';

@Component({
  selector: 'gb-fractalis-chart',
  templateUrl: './gb-fractalis-chart.component.html',
  styleUrls: ['./gb-fractalis-chart.component.css']
})
export class GbFractalisChartComponent implements OnInit {

  @Input() chart: Chart;

  constructor() {
  }

  ngOnInit() {
  }

  get ChartType() {
    return ChartType;
  }

}
