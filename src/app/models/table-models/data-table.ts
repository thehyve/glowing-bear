/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TableDimension} from './table-dimension';
import {Row} from './row';
import {Col} from './col';
import {Constraint} from '../constraint-models/constraint';
import {TrueConstraint} from '../constraint-models/true-constraint';

export class DataTable {

  private _constraint: Constraint;
  private _rowDimensions: Array<TableDimension>;
  private _columnDimensions: Array<TableDimension>;
  /*
   * The structure of the data table
   * _cols    ------> _cols[0],               _cols[1],               _cols[2],               ...
   * _rows[0] ------> _rows[0].data[_col[0]], _rows[0].data[_col[1]], _rows[0].data[_col[2]], ...
   * _rows[1] ------> _rows[1].data[_col[0]], _rows[1].data[_col[1]], _rows[1].data[_col[2]], ...
   * _rows[2] ------> _rows[2].data[_col[0]], _rows[2].data[_col[1]], _rows[2].data[_col[2]], ...
   * _rows[3] ------> _rows[3].data[_col[0]], _rows[3].data[_col[1]], _rows[3].data[_col[2]], ...
   */
  // The actual rows of the table
  private _rows: Array<Row>;
  // The index header row, used when headerRows are not used
  private _cols: Array<Col>;
  // Indicate if there is no more data to get from the back-end
  private _isLastPage: boolean;
  // The offset and limit used to make table calls with pagination
  private _offset: number;
  private _limit: number;
  // The current page of the table
  private _currentPage: number;

  constructor() {
    this.constraint = new TrueConstraint();
    this.isLastPage = false;
    this.currentPage = 1;
    this.offset = 0;
    this.limit = 10;
    this.clear();
  }

  clear() {
    this.clearDimensions();
    this.clearCells();
  }

  clearDimensions() {
    this.rowDimensions = [];
    this.columnDimensions = [];
  }

  clearCells() {
    this.rows = [];
    this.cols = [];
  }

  get rowDimensions(): Array<TableDimension> {
    return this._rowDimensions;
  }

  set rowDimensions(value: Array<TableDimension>) {
    this._rowDimensions = value;
  }

  get columnDimensions(): Array<TableDimension> {
    return this._columnDimensions;
  }

  set columnDimensions(value: Array<TableDimension>) {
    this._columnDimensions = value;
  }

  get rows(): Array<Row> {
    return this._rows;
  }

  set rows(value: Array<Row>) {
    this._rows = value;
  }

  get cols(): Array<Col> {
    return this._cols;
  }

  set cols(value: Array<Col>) {
    this._cols = value;
  }

  get constraint(): Constraint {
    return this._constraint;
  }

  set constraint(value: Constraint) {
    this._constraint = value;
  }

  get offset(): number {
    return this._offset;
  }

  set offset(value: number) {
    this._offset = value;
  }

  get limit(): number {
    return this._limit;
  }

  set limit(value: number) {
    this._limit = value;
  }

  get isLastPage(): boolean {
    return this._isLastPage;
  }

  set isLastPage(value: boolean) {
    this._isLastPage = value;
  }

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(value: number) {
    this._currentPage = value;
    this.offset = this.limit * (value - 1);
  }

}
