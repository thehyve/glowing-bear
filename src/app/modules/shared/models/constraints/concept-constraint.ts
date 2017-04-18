import {Constraint} from './constraint';
import {Concept} from "../concept";

export class ConceptConstraint implements Constraint {

  concept:Concept;

  constructor() {}

  getConstraintType(): string {
    return ConceptConstraint.name;
  }

  toQueryObject(): Object {
    return {
      type: "concept",
      path: this.concept.path
    };
  }

  get textRepresentation(): string {
    if (this.concept) {
      return `Concept: ${this.concept.path}`;
    }
    return 'Concept';
  }
}
