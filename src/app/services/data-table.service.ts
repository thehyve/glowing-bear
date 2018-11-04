/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Dimension} from '../models/table-models/dimension';
import {DataTable} from '../models/table-models/data-table';
import {Row} from '../models/table-models/row';
import {ResourceService} from './resource.service';
import {Col} from '../models/table-models/col';
import {ConstraintService} from './constraint.service';
import {MessageHelper} from '../utilities/message-helper';
import {ErrorHelper} from '../utilities/error-helper';
import {HttpErrorResponse} from '@angular/common/http';
import {Subject} from 'rxjs';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';

@Injectable({
  providedIn: 'root',
})
export class DataTableService {

  private _prevRowDimensions: Array<Dimension>;
  private _prevColDimensions: Array<Dimension>;
  private _dataTable: DataTable;
// Indicate if the current data table is dirty
  private _isDirty: boolean;
  // Indicate if the current data table is updating
  private _isUpdating: boolean;
  // Emit event when data table is done updating
  private _dataTableUpdated: Subject<any>;

  constructor(private resourceService: ResourceService,
              private constraintService: ConstraintService) {
    this.dataTable = new DataTable();
    this.prevRowDimensions = [];
    this.prevColDimensions = [];
    this.isDirty = false;
    this.isUpdating = false;
    this.dataTableUpdated = new Subject();
  }

  public validateDimensions() {
    let sortableDimensions = this.resourceService.sortableDimensions;
    let invalidRowDimensions = this.rowDimensions.filter(dimension =>
      !sortableDimensions.has(dimension.name)
    );
    if (invalidRowDimensions.length > 0) {
      let names = invalidRowDimensions.map(dimension => dimension.name).join(', ');
      let message = `Dimension not allowed as row dimension: ${names}`;
      console.warn(message);
      MessageHelper.alert('warning', message);
      for (let dimension of invalidRowDimensions) {
        let deletedDimensions = this.rowDimensions.splice(this.rowDimensions.indexOf(dimension), 1);
        deletedDimensions.forEach(deletedDimension =>
          this.columnDimensions.push(deletedDimension)
        );
      }
    }
  }

  public updateDataTable(targetDataTable?: DataTable): Promise<any> {

    return new Promise((resolve, reject) => {
      this.isDirty = true;
      this.isUpdating = true;
      this.dataTable = targetDataTable ? targetDataTable : this.dataTable;
      this.dataTable.constraint = this.constraintService.combination;

      this.resourceService.getDataTable(this.dataTable)
        .subscribe(
          (newDataTable: DataTable) => {
            // the new data table contains cell values that the old one does not have
            this.dataTable = newDataTable;
            this.isDirty = false;
            this.isUpdating = false;
            this.dataTableUpdated.next();
            this.updatePrevDimensions();
            resolve(true);
          },
          (err: HttpErrorResponse) => {
            ErrorHelper.handleError(err);
            reject(err.message);
          }
        );
    });
  }

  public nextPage() {
    if (!this.dataTable.isLastPage) {
      this.dataTable.currentPage++;
      this.updateDataTable();
    }
  }

  public previousPage() {
    if (this.dataTable.currentPage > 1) {
      this.dataTable.currentPage--;
      this.updateDataTable();
    }
  }

  private updatePrevDimensions() {
    this.prevRowDimensions = [];
    this.rowDimensions.forEach((dim: Dimension) => {
      this.prevRowDimensions.push(new Dimension(dim.name));
    });
    this.prevColDimensions = [];
    this.columnDimensions.forEach((dim: Dimension) => {
      this.prevColDimensions.push(new Dimension(dim.name));
    });
  }

  get rowDimensions(): Dimension[] {
    return this.dataTable.rowDimensions;
  }

  set rowDimensions(value: Dimension[]) {
    this.dataTable.rowDimensions = value;
  }

  get columnDimensions(): Dimension[] {
    return this.dataTable.columnDimensions;
  }

  set columnDimensions(value: Dimension[]) {
    this.dataTable.columnDimensions = value;
  }

  get rows(): Row[] {
    return this.dataTable.rows;
  }

  get cols(): Col[] {
    return this.dataTable.cols;
  }

  get dataTable(): DataTable {
    return this._dataTable;
  }

  set dataTable(value: DataTable) {
    if (value instanceof DataTable) {
      this._dataTable = value;
    }
  }

  get prevRowDimensions(): Array<Dimension> {
    return this._prevRowDimensions;
  }

  set prevRowDimensions(value: Array<Dimension>) {
    this._prevRowDimensions = value;
  }

  get prevColDimensions(): Array<Dimension> {
    return this._prevColDimensions;
  }

  set prevColDimensions(value: Array<Dimension>) {
    this._prevColDimensions = value;
  }

  get isDirty(): boolean {
    return this._isDirty;
  }

  set isDirty(value: boolean) {
    this._isDirty = value;
  }

  get isUpdating(): boolean {
    return this._isUpdating;
  }

  set isUpdating(value: boolean) {
    this._isUpdating = value;
  }

  get dataTableUpdated(): Subject<boolean> {
    return this._dataTableUpdated;
  }

  set dataTableUpdated(value: Subject<boolean>) {
    this._dataTableUpdated = value;
  }
}
