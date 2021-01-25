/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Injectable} from '@angular/core';
import {TableDimension} from '../models/table-models/table-dimension';
import {DataTable} from '../models/table-models/data-table';
import {Row} from '../models/table-models/row';
import {ResourceService} from './resource.service';
import {Col} from '../models/table-models/col';
import {MessageHelper} from '../utilities/message-helper';
import {ErrorHelper} from '../utilities/error-helper';
import {HttpErrorResponse} from '@angular/common/http';
import {Subject} from 'rxjs';
import {VariableService} from './variable.service';
import {AppConfig} from '../config/app.config';

@Injectable({
  providedIn: 'root',
})
export class DataTableService {

  private _prevRowDimensions: TableDimension[];
  private _prevColDimensions: TableDimension[];
  private _dataTable: DataTable;
  // Indicate if the current data table is dirty
  private _isDirty: boolean;
  // Indicate if the current data table is updating
  private _isUpdating: boolean;
  // Emit event when data table is done updating
  private _dataTableUpdated: Subject<any>;
  // Show a data table in the export tab
  private _includeDataTable: boolean;

  constructor(private resourceService: ResourceService,
              private variableService: VariableService,
              private appConfig: AppConfig) {
    this.dataTable = new DataTable();
    this.prevRowDimensions = [];
    this.prevColDimensions = [];
    this.isDirty = true;
    this.isUpdating = false;
    this.dataTableUpdated = new Subject();
    this.variableService.selectedVariablesTreeUpdated.asObservable()
      .subscribe(() => {
        this.isDirty = true;
      });
    this.includeDataTable = this.appConfig.getConfig('include-data-table');
  }

  public validateDimensions() {
    this.isDirty = true;
    let sortableDimensions = this.resourceService.sortableDimensions;
    let invalidRowDimensions = this.rowDimensions.filter(dimension =>
      !sortableDimensions.has(dimension.name)
    );
    if (invalidRowDimensions.length > 0) {
      let names = invalidRowDimensions.map(dimension => dimension.name).join(', ');
      let message = `Dimension not allowed as row dimension: ${names}`;
      console.warn(message);
      MessageHelper.alert('warn', message);
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
      this.dataTable.constraint = this.variableService.combination;

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
    this.rowDimensions.forEach((dim: TableDimension) => {
      this.prevRowDimensions.push(new TableDimension(dim.name));
    });
    this.prevColDimensions = [];
    this.columnDimensions.forEach((dim: TableDimension) => {
      this.prevColDimensions.push(new TableDimension(dim.name));
    });
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

  get prevRowDimensions(): TableDimension[] {
    return this._prevRowDimensions;
  }

  set prevRowDimensions(value: TableDimension[]) {
    this._prevRowDimensions = value;
  }

  get prevColDimensions(): TableDimension[] {
    return this._prevColDimensions;
  }

  set prevColDimensions(value: TableDimension[]) {
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

  get includeDataTable(): boolean {
    return this._includeDataTable;
  }

  set includeDataTable(value: boolean) {
    this._includeDataTable = value;
  }
}
