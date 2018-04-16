import {Dimension} from './dimension';
import {Row} from './row';
import {HeaderRow} from './header-row';
import {Col} from './col';
import {Constraint} from '../constraint-models/constraint';
import {TrueConstraint} from '../constraint-models/true-constraint';

export class DataTable {

  private _constraint: Constraint;
  private _rowDimensions: Array<Dimension>;
  private _columnDimensions: Array<Dimension>;
  private _rows: Array<Row>;
  // The filler header row, used when headerRows are now used
  private _cols: Array<Col>;
  // The hierarchical header rows with merged cells, used when cols are now used
  private _headerRows: Array<HeaderRow>;
  // Indicate if the current data table is dirty
  private _isDirty: boolean;

  constructor() {
    this.constraint = new TrueConstraint();
    this.isDirty = false;
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

  get cols(): Array<Col> {
    return this._cols;
  }

  set cols(value: Array<Col>) {
    this._cols = value;
  }

  get headerRows(): Array<HeaderRow> {
    return this._headerRows;
  }

  set headerRows(value: Array<HeaderRow>) {
    this._headerRows = value;
  }

  get constraint(): Constraint {
    return this._constraint;
  }

  set constraint(value: Constraint) {
    this._constraint = value;
  }

  get isDirty(): boolean {
    return this._isDirty;
  }

  set isDirty(value: boolean) {
    this._isDirty = value;
  }
}
