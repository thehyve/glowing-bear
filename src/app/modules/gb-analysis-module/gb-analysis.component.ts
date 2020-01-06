/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {ChartService} from '../../services/chart.service';

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

}
