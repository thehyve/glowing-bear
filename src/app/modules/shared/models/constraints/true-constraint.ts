import {Constraint} from './constraint';

export class TrueConstraint implements Constraint {

  private _type: string;

  constructor() {
    this._type = 'TrueConstraint';
  }

  getConstraintType(): string {
    return this._type;
  }

  toQueryObject(): Object {
    return {"type": "true"};
  }

  get textRepresentation(): string {
    return 'True';
  }
}
