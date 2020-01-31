/**
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';
import {ExploreQueryType} from '../../models/query-models/explore-query-type';
import {QueryService} from '../../services/query.service';
import {MedcoNetworkService} from '../../services/api/medco-network.service';

@Component({
  selector: 'gb-medco-results',
  templateUrl: './gb-explore-results.component.html',
  styleUrls: ['./gb-explore-results.component.css']
})
export class GbExploreResultsComponent implements OnInit {

  @ViewChild('medcoResultsChart', { static: true }) medcoResultsChart: ElementRef;

  private _resultChart: Chart;

  constructor(private medcoNetworkService: MedcoNetworkService,
              private queryService: QueryService) { }

  ngOnInit() {
    this._resultChart = new Chart(this.medcoResultsChart.nativeElement, {
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

    this.resultChart.data.labels = this.nodesName;
    this.resultChart.data.datasets[0].data = this.perSiteCounts;
    this.resultChart.update();
    // todo: what about an update ?
  }

  get resultChart(): Chart {
    return this._resultChart;
  }

  get nodesName(): string[] {
    return this.medcoNetworkService.nodes.map((node) => node.name);
  }

  get perSiteCountsAvailable(): boolean {
    return this.patientListsAvailable ||
      this.queryType === ExploreQueryType.COUNT_PER_SITE ||
      this.queryType === ExploreQueryType.COUNT_PER_SITE_OBFUSCATED ||
      this.queryType === ExploreQueryType.COUNT_PER_SITE_SHUFFLED ||
      this.queryType === ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED;
  }

  get perSiteCounts(): number[] {
    return this.queryService.perSiteCounts;
  }

  get queryType(): ExploreQueryType {
    return this.queryService.query.type;
  }

  get patientListsAvailable(): boolean {
    return this.queryType === ExploreQueryType.PATIENT_LIST;
  }

  get patientLists(): string[][] {
    return this.queryService.patientLists;
}
}
