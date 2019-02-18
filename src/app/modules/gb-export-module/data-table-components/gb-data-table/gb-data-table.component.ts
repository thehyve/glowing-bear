/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {DataTableService} from '../../../../services/data-table.service';

@Component({
  selector: 'gb-data-table',
  templateUrl: './gb-data-table.component.html',
  styleUrls: ['./gb-data-table.component.css']
})
export class GbDataTableComponent implements OnInit {

  constructor(private dataTableService: DataTableService) {
  }

  ngOnInit() {
  }

  update() {
    if (!this.dataTableService.isUpdating) {
      this.dataTableService.updateDataTable();
    }
  }

  get isDirty(): boolean {
    return this.dataTableService.isDirty;
  }

  get isUpdating(): boolean {
    return this.dataTableService.isUpdating;
  }
}
