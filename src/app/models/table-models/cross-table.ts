import {Constraint} from '../constraint-models/constraint';
import {Row} from './row';
import {Col} from './col';
import {CrossTableCell} from './cross-table-cell';

export class CrossTable {
  // the row and column constraints used in the drag & drop zones
  private _rowConstraints: Array<Constraint> = [];
  private _columnConstraints: Array<Constraint> = [];
  /*
   * the keys of the header constraints are the row/column constraints,
   * the header constraints are the ones that are sent to backend to get the table content,
   * usually a header constraint is a value constraint from one of the row/col constraints,
   * sometimes combined with a study constraint
   */
  private _headerConstraints: Map<Constraint, Array<Constraint>>;
  /*
   * the cells of the cross table, the rows (see below) are constructed from the cells,
   * the cells keep a dictionary of cells based on their header constraint coordinates
   */
  private _cells: Array<CrossTableCell> = [];
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

  constructor() {
    this.headerConstraints = new Map<Constraint, Array<Constraint>>();
  }

  addHeaderConstraint(keyConstraint: Constraint, valueConstraint: Constraint) {
    if (this.rowConstraints.includes(keyConstraint) || this.columnConstraints.includes(keyConstraint)) {
      let vals = this.headerConstraints.get(keyConstraint);
      vals = vals ? vals : new Array<Constraint>();
      vals.push(valueConstraint);
      this.headerConstraints.set(keyConstraint, vals);
    }
  }

  getCell(constraintOne: Constraint, constraintTheOther: Constraint): CrossTableCell {
    for (let cell of this.cells) {
      if (cell.match(constraintOne, constraintTheOther)) {
        return cell;
      }
    }
    return null;
  }

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

  get headerConstraints(): Map<Constraint, Array<Constraint>> {
    return this._headerConstraints;
  }

  set headerConstraints(value: Map<Constraint, Array<Constraint>>) {
    this._headerConstraints = value;
  }

  get cells(): Array<CrossTableCell> {
    return this._cells;
  }

  set cells(value: Array<CrossTableCell>) {
    this._cells = value;
  }
}
