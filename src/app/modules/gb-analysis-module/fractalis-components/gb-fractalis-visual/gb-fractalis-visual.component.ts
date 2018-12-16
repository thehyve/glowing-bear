/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Component, OnInit} from '@angular/core';
import {FractalisService} from '../../../../services/fractalis.service';
import {Chart} from '../../../../models/chart-models/chart';

@Component({
  selector: 'gb-fractalis-visual',
  templateUrl: './gb-fractalis-visual.component.html',
  styleUrls: ['./gb-fractalis-visual.component.css']
})
export class GbFractalisVisualComponent implements OnInit {

  constructor(private fractalisService: FractalisService) {
  }

  ngOnInit() {
  }

  onRemoveChart(e, chart: Chart) {
    e.preventDefault();
    e.stopPropagation();
    this.fractalisService.removeChart(chart);
  }

  onClearCharts() {
    this.fractalisService.charts.length = 0;
  }

  get charts(): Chart[] {
    return this.fractalisService.charts;
  }

  get chartSize(): number {
    return this.fractalisService.chartDivSize;
  }

  set chartSize(value: number) {
    this.fractalisService.chartDivSize = value;
  }

}
