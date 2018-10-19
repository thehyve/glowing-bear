/**
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {MedcoService} from "../../services/picsure-services/medco.service";
import {MedcoResult} from "../../models/picsure-models/medco-result";
import {Chart} from 'chart.js';

@Component({
  selector: 'gb-medco-results',
  templateUrl: './gb-medco-results.component.html',
  styleUrls: ['./gb-medco-results.component.css']
})
export class GbMedcoResultsComponent implements OnInit {


  private _resultChart: Chart;
  private _medcoResult: MedcoResult[];

  constructor(private medcoService: MedcoService) { }

  ngOnInit() {
    this.medcoService.results.subscribe( (results: MedcoResult[]) => {
      this._medcoResult = results;
      this._resultChart = new Chart('medco-results-chart', {
        type: 'doughnut',
        data: {
          labels: results.map((r) => r.siteName),
          datasets: [{
            label: '# of subjects',
            data: results.map((r) => r.subjectCount),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 159, 64, 0.5)',
            ],
          }]
        },
        options: { }
      });
      this.resultChart.update();
    });
  }

  get resultChart(): Chart {
    return this._resultChart;
  }

  get medcoResult(): object {
    return this._medcoResult;
  }
}
