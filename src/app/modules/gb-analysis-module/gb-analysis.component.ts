/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {ChartService} from '../../services/chart.service';
import {Chart} from '../../models/chart-models/chart';

@Component({
  selector: 'gb-analysis',
  templateUrl: './gb-analysis.component.html',
  styleUrls: ['./gb-analysis.component.css']
})
export class GbAnalysisComponent implements OnInit {

  constructor(private chartService: ChartService) {
  }

  ngOnInit() {
  }

  onCreateChart() {
    this.chartService.isChartSelectionMode = true;
  }

  onRemoveChart(e, chart: Chart) {
    e.preventDefault();
    e.stopPropagation();
    this.chartService.removeChart(chart);
  }

  get currentChart(): Chart {
    return this.chartService.currentChart;
  }

  get charts(): Chart[] {
    return this.chartService.charts;
  }

  get chartSize(): number {
    return this.chartService.chartDivSize;
  }

  set chartSize(value: number) {
    this.chartService.chartDivSize = value;
  }

}
