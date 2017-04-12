import {Constraint} from './constraint';

export class ConceptConstraint implements Constraint {

  constructor() {}

  getConstraintType(): string {
    return ConceptConstraint.name;
  }

  toJsonString(): string {
    return '';
  }
}
