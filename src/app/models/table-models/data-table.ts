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
  /*
   * The Stucture of the data table
   * _cols    ------> _cols[0],               _cols[1],               _cols[2],               ...
   * _rows[0] ------> _rows[0].data[_col[0]], _rows[0].data[_col[1]], _rows[0].data[_col[2]], ...
   * _rows[1] ------> _rows[1].data[_col[0]], _rows[1].data[_col[1]], _rows[1].data[_col[2]], ...
   * _rows[2] ------> _rows[2].data[_col[0]], _rows[2].data[_col[1]], _rows[2].data[_col[2]], ...
   * _rows[3] ------> _rows[3].data[_col[0]], _rows[3].data[_col[1]], _rows[3].data[_col[2]], ...
   */
  // The actual rows of the table
  private _rows: Array<Row>;
  // The filler header row, used when headerRows are now used
  private _cols: Array<Col>;
  // The hierarchical header rows with merged cells, used when cols are now used
  private _headerRows: Array<HeaderRow>;
  // Indicate if the current data table is dirty
  private _isDirty: boolean;
  // Indicate if the current data table is updating
  private _isUpdating: boolean;
  // Indicate if using merged-cell headers
  private _isUsingHeaders: boolean;
  // Indicate if there is no more data to get from the back-end
  private _isLastPage: boolean;
  // The offset and limit used to make table calls with pagination
  private _offset: number;
  private _limit: number;
  // The current page of the table
  private _currentPage: number;

  constructor() {
    this.constraint = new TrueConstraint();
    this.isDirty = false;
    this.isUsingHeaders = false;
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

  get isUpdating(): boolean {
    return this._isUpdating;
  }

  set isUpdating(value: boolean) {
    this._isUpdating = value;
  }

  get isUsingHeaders(): boolean {
    return this._isUsingHeaders;
  }

  set isUsingHeaders(value: boolean) {
    this._isUsingHeaders = value;
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
