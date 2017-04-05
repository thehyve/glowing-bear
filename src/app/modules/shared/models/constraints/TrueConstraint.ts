import {Constraint} from './Constraint';

export class TrueConstraint implements Constraint {

  toJsonString(): string {
    return '{"type": "true"}';
  }
}
