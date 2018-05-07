import {Constraint} from '../constraint-models/constraint';
import {Row} from './row';
import {Col} from './col';

export class CrossTable {
  // the row and column constraints used in the drag & drop zones
  private _rowConstraints: Array<Constraint> = [];
  private _columnConstraints: Array<Constraint> = [];
  // the constraints used in the row and column headers of the table
  // they are derived from _rowConstraints and _columnConstraints
  private _rowHeaderConstraints: Array<Constraint> = [];
  private _columnHeaderConstraints: Array<Constraint> = [];
  /*
   * The structure of the cross table
   * _cols    ------> _cols[0],               _cols[1],               _cols[2],               ...
   * _rows[0] ------> _rows[0].data[_col[0]], _rows[0].data[_col[1]], _rows[0].data[_col[2]], ...
   * _rows[1] ------> _rows[1].data[_col[0]], _rows[1].data[_col[1]], _rows[1].data[_col[2]], ...
   * _rows[2] ------> _rows[2].data[_col[0]], _rows[2].data[_col[1]], _rows[2].data[_col[2]], ...
   * _rows[3] ------> _rows[3].data[_col[0]], _rows[3].data[_col[1]], _rows[3].data[_col[2]], ...
   */
  // The actual rows
  private _rows: Array<Row> = [];
  // The index header row
  private _cols: Array<Col> = [];

  get rowConstraints(): Array<Constraint> {
    return this._rowConstraints;
  }

  set rowConstraints(value: Array<Constraint>) {
    this._rowConstraints = value;
  }

  get columnConstraints(): Array<Constraint> {
    return this._columnConstraints;
  }

  set columnConstraints(value: Array<Constraint>) {
    this._columnConstraints = value;
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

  get rowHeaderConstraints(): Array<Constraint> {
    return this._rowHeaderConstraints;
  }

  set rowHeaderConstraints(value: Array<Constraint>) {
    this._rowHeaderConstraints = value;
  }

  get columnHeaderConstraints(): Array<Constraint> {
    return this._columnHeaderConstraints;
  }

  set columnHeaderConstraints(value: Array<Constraint>) {
    this._columnHeaderConstraints = value;
  }
}
