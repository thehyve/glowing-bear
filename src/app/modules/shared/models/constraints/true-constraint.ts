import {Constraint} from './constraint';

export class TrueConstraint implements Constraint {

  getConstraintType(): string {
    return 'true-constraint';
  }

  toQueryObject(): Object {
    return {"type": "true"};
  }

  get textRepresentation(): string {
    return 'True';
  }
}
