import {Constraint} from './constraint';

export class TrueConstraint implements Constraint {

  toJsonString(): string {
    return '{"type": "true"}';
  }
}
