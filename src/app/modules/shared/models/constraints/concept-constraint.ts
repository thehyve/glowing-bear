import {Constraint} from './constraint';

export class ConceptConstraint implements Constraint {

  path:string;

  constructor() {}

  getConstraintType(): string {
    return ConceptConstraint.name;
  }

  toQueryObject(): Object {
    return {
      type: "concept",
      path: this.path
    };
  }

  get textRepresentation(): string {
    if (this.path) {
      return `Concept: ${this.path}`;
    }
    return 'Concept';
  }
}
