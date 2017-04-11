import {Constraint} from './constraint';

export class TrueConstraint implements Constraint {

  getConstraintType(): string {
    return 'true-constraint';
  }

  toJsonString(): string {
    return '{"type": "true"}';
  }
}
