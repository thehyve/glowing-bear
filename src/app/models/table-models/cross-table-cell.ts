import {Constraint} from '../constraint-models/constraint';

export class CrossTableCell {
  // the coordinates of cell
  private _constraint1: Constraint;
  private _constraint2: Constraint;
  // the value of the cell
  private _value: any;

  constructor(constraint1: Constraint,
              constraint2: Constraint,
              value: number) {
    this.constraint1 = constraint1;
    this.constraint2 = constraint2;
    this.value = value;
  }

  match(constraintOne: Constraint, constraintTheOther: Constraint) {
    return (constraintOne === this.constraint1 && constraintTheOther === this.constraint2) ||
      (constraintTheOther === this.constraint2 && constraintOne === this.constraint1);
  }

  get constraint1(): Constraint {
    return this._constraint1;
  }

  set constraint1(value: Constraint) {
    this._constraint1 = value;
  }

  get constraint2(): Constraint {
    return this._constraint2;
  }

  set constraint2(value: Constraint) {
    this._constraint2 = value;
  }

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this._value = value;
  }
}
