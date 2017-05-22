import {Constraint} from './constraint';

export class TrueConstraint implements Constraint {

  constructor() {
  }

  getClassName(): string {
    return 'TrueConstraint';
  }

  toQueryObject(): Object {
    return {"type": "true"};
  }

  get textRepresentation(): string {
    return 'True';
  }
}
