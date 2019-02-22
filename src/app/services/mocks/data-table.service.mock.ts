/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TableDimension} from '../../models/table-models/table-dimension';
import {DataTable} from '../../models/table-models/data-table';
import {Row} from '../../models/table-models/row';
import {Col} from '../../models/table-models/col';
import {TableDimensionValue} from '../../models/table-models/table-dimension-value';
import {Subject} from 'rxjs';

export class DataTableServiceMock {

  private _prevRowDimensions: Array<TableDimension>;
  private _prevColDimensions: Array<TableDimension>;
  private _dataTable: DataTable;
  private _currentPage: number;
  dataTableUpdated: Subject<any>;

  constructor() {
    this.dataTable = new DataTable();
    this.prevRowDimensions = [];
    this.prevColDimensions = [];
    this.currentPage = 1;
    this.dataTableUpdated = new Subject();
    this.dataTableUpdated.next();
  }

  updateDataTable(targetDataTable?: DataTable) {
  }

  get prevRowDimensions(): Array<TableDimension> {
    return this._prevRowDimensions;
  }

  set prevRowDimensions(value: Array<TableDimension>) {
    this._prevRowDimensions = value;
  }

  get prevColDimensions(): Array<TableDimension> {
    return this._prevColDimensions;
  }

  set prevColDimensions(value: Array<TableDimension>) {
    this._prevColDimensions = value;
  }

  get dataTable(): DataTable {
    return this._dataTable;
  }

  set dataTable(value: DataTable) {
    this._dataTable = value;
  }

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(value: number) {
    this._currentPage = value;
  }

  get rows(): Row[] {
    return this.dataTable.rows;
  }

  get cols(): Col[] {
    return this.dataTable.cols;
  }

  get rowDimensions(): TableDimension[] {
    return this.dataTable.rowDimensions;
  }

  set rowDimensions(value: TableDimension[]) {
    this.dataTable.rowDimensions = value;
  }

  get columnDimensions(): TableDimension[] {
    return this.dataTable.columnDimensions;
  }

  set columnDimensions(value: TableDimension[]) {
    this.dataTable.columnDimensions = value;
  }
}
