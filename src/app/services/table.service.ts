import {Injectable} from '@angular/core';
import {Dimension} from '../models/table-models/dimension';
import {DataTable} from '../models/table-models/data-table';
import {Row} from '../models/table-models/row';
import {ResourceService} from './resource.service';
import {Col} from '../models/table-models/col';
import {ConstraintService} from './constraint.service';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {HeaderRow} from '../models/table-models/header-row';
import {DimensionValue} from '../models/table-models/dimension-value';

@Injectable()
export class TableService {

  private _prevRowDimensions: Array<Dimension>;
  private _prevColDimensions: Array<Dimension>;
  private _dataTable: DataTable;
  private _currentPage: number;
  // Indicate if using merged-cell headers
  private _isUsingHeaders: boolean;

  constructor(private resourceService: ResourceService,
              private constraintService: ConstraintService) {
    this.dataTable = new DataTable();
    this.prevRowDimensions = [];
    this.prevColDimensions = [];
    this.currentPage = 1;
    this.isUsingHeaders = false;
    this.updateDataTable();
  }

  updateDataTable(targetDataTable?: DataTable) {
    this.dataTable.isDirty = true;
    this.dataTable.isUpdating = true;
    this.dataTable = targetDataTable ? targetDataTable : this.dataTable;
    const constraint_1_2 = this.constraintService.constraint_1_2();
    this.dataTable.constraint = constraint_1_2;
    this.resourceService.getDimensions(constraint_1_2)
      .subscribe((availableDimensions: Dimension[]) => {
        // update dimensions
        let availableDimensionNames = new Array<string>();
        availableDimensions.forEach((dim: Dimension) => {
          availableDimensionNames.push(dim.name);
        });
        let takenDimensionNames = new Array<string>();
        let newRowDimensions = new Array<Dimension>();
        this.dataTable.rowDimensions.forEach((dim: Dimension) => {
          if (availableDimensionNames.includes(dim.name)) {
            newRowDimensions.push(dim);
            takenDimensionNames.push(dim.name);
          }
        });
        let newColumnDimensions = new Array<Dimension>();
        this.dataTable.columnDimensions.forEach((dim: Dimension) => {
          if (availableDimensionNames.includes(dim.name)) {
            newColumnDimensions.push(dim);
            takenDimensionNames.push(dim.name);
          }
        });
        availableDimensions.forEach((dim: Dimension) => {
          if (!takenDimensionNames.includes(dim.name)) {
            this.dataTable.rowDimensions.push(dim);
          }
        });
        let offset = 0;
        let limit = 10;
        this.resourceService.getDataTable(this.dataTable, offset, limit, this.isUsingHeaders)
          .subscribe(
            (newDataTable: DataTable) => {
              this.dataTable = newDataTable;
              this.dataTable.isDirty = false;
              this.dataTable.isUpdating = false;
            }
          );
      });
  }

  public nextPage() {
    // TODO: connect to backend, check if the last page is reached
    this.currentPage++;
  }

  public previousPage() {
    // TODO: connect to backend, check if the first page is reached
    this.currentPage--;
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

  get headerRows(): Array<HeaderRow> {
    return this.dataTable.headerRows;
  }

  get dataTable(): DataTable {
    return this._dataTable;
  }

  set dataTable(value: DataTable) {
    this._dataTable = value;
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

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(value: number) {
    this._currentPage = value;
  }

  get isUsingHeaders(): boolean {
    return this._isUsingHeaders;
  }

  set isUsingHeaders(value: boolean) {
    this._isUsingHeaders = value;
  }

}
