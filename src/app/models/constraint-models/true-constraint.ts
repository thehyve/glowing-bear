import {Constraint} from './constraint';

export class TrueConstraint extends Constraint {

  constructor() {
    super();
    this.textRepresentation = 'True';
  }

  get className(): string {
    return 'TrueConstraint';
  }
}
