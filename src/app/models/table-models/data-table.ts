import {Dimension} from './dimension';
import {Row} from './row';

export class DataTable {
  private _rowDimensions: Array<Dimension>;
  private _columnDimensions: Array<Dimension>;
  private _rows: Array<Row>;

  constructor() {
    this.rowDimensions = [];
    this.columnDimensions = [];
    this.rows = [];
  }

  get rowDimensions(): Array<Dimension> {
    return this._rowDimensions;
  }

  set rowDimensions(value: Array<Dimension>) {
    this._rowDimensions = value;
  }

  get columnDimensions(): Array<Dimension> {
    return this._columnDimensions;
  }

  set columnDimensions(value: Array<Dimension>) {
    this._columnDimensions = value;
  }

  get rows(): Array<Row> {
    return this._rows;
  }

  set rows(value: Array<Row>) {
    this._rows = value;
  }
}
