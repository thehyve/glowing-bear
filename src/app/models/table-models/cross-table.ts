import {Constraint} from '../constraint-models/constraint';
import {Row} from './row';
import {Col} from './col';
import {TrueConstraint} from '../constraint-models/true-constraint';
import {CombinationConstraint} from '../constraint-models/combination-constraint';
import {ConstraintMark} from '../constraint-models/constraint-mark';

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
  // The index top row
  private _cols: Array<Col> = [];

  constructor() {
    this.constraint = new TrueConstraint();
    this.valueConstraints = new Map<Constraint, Array<Constraint>>();
  }

  public addValueConstraint(keyConstraint: Constraint, valueConstraint: Constraint) {
    if (this.rowConstraints.includes(keyConstraint) || this.columnConstraints.includes(keyConstraint)) {
      let vals = this.valueConstraints.get(keyConstraint);
      vals = vals ? vals : new Array<Constraint>();
      vals.push(valueConstraint);
      this.valueConstraints.set(keyConstraint, vals);
    }
  }

  public updateHeaderConstraints() {
    this.rowHeaderConstraints = this.crossConstraints(this.rowConstraints);
    this.columnHeaderConstraints = this.crossConstraints(this.columnConstraints);
  }

  private crossConstraints(constraints: Array<Constraint>): Array<Constraint> {
    if (constraints.length > 0) {
      let combinations = new Array<CombinationConstraint>();
      // first constraint
      let below0 = this.getConstraintsBelow(constraints[0], constraints);
      let valueRepetition0 = 1;
      for (let b of below0) {
        valueRepetition0 = valueRepetition0 * this.valueConstraints.get(b).length;
      }
      let vals0 = this.valueConstraints.get(constraints[0]);
      for (let val of vals0) {
        for (let i = 0; i < valueRepetition0; i++) {
          let c = new CombinationConstraint();
          c.addChild(val);
          c.mark = ConstraintMark.SUBJECT;
          combinations.push(c);
        }
      }
      // the remaining constraints
      let index = 0;
      for (let i = 1; i < constraints.length; i++) {
        let above = this.getConstraintsAbove(constraints[i], constraints);
        let selfRepetition = 1;
        for (let a of above) {
          selfRepetition = selfRepetition * this.valueConstraints.get(a).length;
        }
        let below = this.getConstraintsBelow(constraints[i], constraints);
        let valueRepetition = 1;
        for (let b of below) {
          valueRepetition = valueRepetition * this.valueConstraints.get(b).length;
        }
        let vals = this.valueConstraints.get(constraints[i]);
        for (let j = 0; j < selfRepetition; j++) {
          for (let val of vals) {
            for (let k = 0; k < valueRepetition; k++) {
              combinations[index].addChild(val);
              let nIndex = index + 1;
              index = (nIndex === combinations.length) ? 0 : nIndex;
            }
          }
        }
      }
      return combinations;
    } else {
      return [new TrueConstraint()];
    }

  }

  private getConstraintsBelow(current: Constraint, list: Constraint[]): Constraint[] {
    let below = [];
    let index = list.indexOf(current);
    for (let i = index + 1; i < list.length; i++) {
      below.push(list[i]);
    }
    return below;
  }

  private getConstraintsAbove(current: Constraint, list: Constraint[]): Constraint[] {
    let above = [];
    let index = list.indexOf(current);
    for (let i = index - 1; i >= 0; i--) {
      above.push(list[i]);
    }
    return above;
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

  get constraint(): Constraint {
    return this._constraint;
  }

  set constraint(value: Constraint) {
    this._constraint = value;
  }
}
