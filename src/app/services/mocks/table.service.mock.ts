import {Dimension} from '../../models/table-models/dimension';
import {DataTable} from '../../models/table-models/data-table';
import {Row} from '../../models/table-models/row';
import {Col} from '../../models/table-models/col';

export class TableServiceMock {

  private _prevRowDimensions: Array<Dimension>;
  private _prevColDimensions: Array<Dimension>;
  private _dataTable: DataTable;
  private _currentPage: number;
  // Indicate if using merged-cell headers
  private _isUsingHeaders: boolean;

  constructor() {
    this.dataTable = new DataTable();
    this.prevRowDimensions = [];
    this.prevColDimensions = [];
    this.currentPage = 1;
    this.isUsingHeaders = false;
  }

  updateTable(targetDataTable?: DataTable) {
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

  get isUsingHeaders(): boolean {
    return this._isUsingHeaders;
  }

  set isUsingHeaders(value: boolean) {
    this._isUsingHeaders = value;
  }

  get rows(): Row[] {
    return this.dataTable.rows;
  }

  get cols(): Col[] {
    return this.dataTable.cols;
  }
}
