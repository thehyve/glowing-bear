import {Constraint} from '../constraint-models/constraint';
import {Row} from './row';
import {Col} from './col';
import {TrueConstraint} from '../constraint-models/true-constraint';

export class CrossTable {
  // the base constraint that the row/col constraints are conditioned on
  private _constraint: Constraint;
  // the row and column constraints used in the drag & drop zones
  private _rowConstraints: Array<Constraint> = [];
  private _columnConstraints: Array<Constraint> = [];
  /*
   * the keys of the value constraints are the row/column constraints,
   * a value constraint is typically a categorical value constraint,
   * sometimes combined with a study constraint
   */
  private _valueConstraints: Map<Constraint, Array<Constraint>>;
  /*
   * the header constraints used as input params for backend call
   */
  private _rowHeaderConstraints: Constraint[][];
  private _columnHeaderConstraints: Constraint[][];
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
  // The index top row
  private _cols: Array<Col> = [];

  constructor() {
    this.constraint = new TrueConstraint();
    this.valueConstraints = new Map<Constraint, Array<Constraint>>();
  }

  public addValueConstraints(keyConstraint: Constraint, valueConstraints: Constraint[]) {
    if (!(this.rowConstraints.includes(keyConstraint) || this.columnConstraints.includes(keyConstraint))) {
      throw new Error('Constraint not present in the cross table');
    }
    this.valueConstraints.set(keyConstraint, valueConstraints);
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

  get valueConstraints(): Map<Constraint, Array<Constraint>> {
    return this._valueConstraints;
  }

  set valueConstraints(value: Map<Constraint, Array<Constraint>>) {
    this._valueConstraints = value;
  }

  get rowHeaderConstraints(): Constraint[][] {
    return this._rowHeaderConstraints;
  }

  set rowHeaderConstraints(value: Constraint[][]) {
    this._rowHeaderConstraints = value;
  }

  get columnHeaderConstraints(): Constraint[][] {
    return this._columnHeaderConstraints;
  }

  set columnHeaderConstraints(value: Constraint[][]) {
    this._columnHeaderConstraints = value;
  }

  get constraint(): Constraint {
    return this._constraint;
  }

  set constraint(value: Constraint) {
    this._constraint = value;
  }
}
