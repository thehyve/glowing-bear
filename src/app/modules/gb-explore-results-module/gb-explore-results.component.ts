/**
 * Copyright 2018 - 2021 EPFL LCA1 / LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { QueryService } from '../../services/query.service';
import { MedcoNetworkService } from '../../services/api/medco-network.service';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { savePatientListToCSVFile } from 'app/utilities/files/csv';

@Component({
  selector: 'gb-medco-results',
  templateUrl: './gb-explore-results.component.html',
  styleUrls: ['./gb-explore-results.component.css']
})
export class GbExploreResultsComponent implements OnInit {

  @ViewChild('perSiteCountsChartElement', { static: true }) perSiteCountsChartElement: ElementRef;

  private _perSiteCountsChart: Chart;

  constructor(private medcoNetworkService: MedcoNetworkService, public queryService: QueryService) { }

  ngOnInit() {
    this._perSiteCountsChart = new Chart(this.perSiteCountsChartElement.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          label: '# of subjects',
          data: [],
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
      options: {
        legend: {
          position: 'right',
          labels: {
            fontSize: 20
          }
        }
      }
    });

    this.queryService.queryResults.subscribe((queryResults) => {
      if (queryResults && this.queryService.queryType.hasPerSiteCounts) {
        this.perSiteCountsChart.data.labels = this.nodesName;
        this.perSiteCountsChart.data.datasets[0].data = queryResults.perSiteCounts;
      } else {
        this.perSiteCountsChart.data.labels = [];
        this.perSiteCountsChart.data.datasets[0].data = [];
      }

      this.perSiteCountsChart.update();
    })
  }

  get perSiteCountsChart(): Chart {
    return this._perSiteCountsChart;
  }

  get nodesName(): string[] {
    return this.medcoNetworkService.nodes.map((node) => node.name);
  }

  get perSiteCounts(): Observable<number[]> {
    return this.queryService.queryResults.pipe(map((queryResults) =>
      queryResults ? queryResults.perSiteCounts : []
    ));
  }

  get patientLists(): Observable<number[][]> {
    return this.queryService.queryResults.pipe(map((queryResults) =>
      queryResults ? queryResults.patientLists : []
    ));
  }

  savePatientListToCSVFile() {
    this.queryService.queryResults.pipe(first()).subscribe(
      (queryResult) => {
        if (!queryResult) {
          return;
        }
        savePatientListToCSVFile('patientList', queryResult.nodes.map(node => node.name), queryResult.patientLists);
      }
    )
  }
}
