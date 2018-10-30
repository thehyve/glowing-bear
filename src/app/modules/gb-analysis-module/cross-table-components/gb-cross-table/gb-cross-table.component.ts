/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {CrossTableService} from '../../../../services/cross-table.service';
import {Constraint} from '../../../../models/constraint-models/constraint';
import {Row} from '../../../../models/table-models/row';
import {Col} from '../../../../models/table-models/col';
import {FormatHelper} from '../../../../utilities/format-helper';

@Component({
  selector: 'gb-cross-table',
  templateUrl: './gb-cross-table.component.html',
  styleUrls: ['./gb-cross-table.component.css']
})
export class GbCrossTableComponent implements OnInit {

  constructor(private crossTableService: CrossTableService) {
  }

  ngOnInit() {
  }

  get rowConstraints(): Array<Constraint> {
    return this.crossTableService.rowConstraints;
  }

  get columnConstraints(): Array<Constraint> {
    return this.crossTableService.columnConstraints;
  }

  get rows(): Array<Row> {
    return this.crossTableService.rows;
  }

  get cols(): Array<Col> {
    return this.crossTableService.cols;
  }

  get isUpdating(): boolean {
    return this.crossTableService.crossTable.isUpdating;
  }

  formatCountNumber(value: any): any {
    if (typeof value === 'number') {
      return FormatHelper.formatCountNumber(value);
    } else {
      return value;
    }
  }
}
