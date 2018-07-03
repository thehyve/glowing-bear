/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {DataTableService} from '../../../../services/data-table.service';
import {Row} from '../../../../models/table-models/row';
import {Col} from '../../../../models/table-models/col';

@Component({
  selector: 'gb-data-table-grid',
  templateUrl: './gb-data-table-grid.component.html',
  styleUrls: ['./gb-data-table-grid.component.css']
})
export class GbDataTableGridComponent implements OnInit {

  constructor(private dataTableService: DataTableService) {
  }

  ngOnInit() {
    this.dataTableService.init();
  }

  get rows(): Row[] {
    return this.dataTableService.rows;
  }

  get cols(): Col[] {
    return this.dataTableService.cols;
  }

  get currentPage(): number {
    return this.dataTableService.dataTable.currentPage;
  }

  nextPage() {
    this.dataTableService.nextPage();
  }

  previousPage() {
    this.dataTableService.previousPage();
  }
}
