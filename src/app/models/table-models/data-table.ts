import {Dimension} from './dimension';
import {Row} from './row';
import {HeaderRow} from "./header-row";

export class DataTable {
  private _rowDimensions: Array<Dimension>;
  private _columnDimensions: Array<Dimension>;
  private _rows: Array<Row>;
  private _headerRows: Array<HeaderRow>;

  constructor() {
    this.clear();
  }

  clear() {
    this.rowDimensions = [];
    this.columnDimensions = [];
    this.rows = [];
    this.headerRows = [];
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

  get headerRows(): Array<HeaderRow> {
    return this._headerRows;
  }

  set headerRows(value: Array<HeaderRow>) {
    this._headerRows = value;
  }
}
