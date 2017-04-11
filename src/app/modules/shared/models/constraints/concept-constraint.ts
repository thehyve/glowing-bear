import {Constraint} from './constraint';

export class ConceptConstraint implements Constraint {

  constructor() {}

  getConstraintType(): string {
    return 'concept-constraint';
  }

  toJsonString(): string {
    return '';
  }
}
