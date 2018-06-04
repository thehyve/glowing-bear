import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {ConceptType} from '../models/constraint-models/concept-type';
import {Constraint} from '../models/constraint-models/constraint';

export class ConstraintHelper {

  /**
   * Tests if the constraint is a concept constraint for a categorical concept.
   *
   * @param {Constraint} constraint
   * @return {boolean} true if the constraint is a categorical concept constraint; false otherwise.
   */
  public static isCategoricalConceptConstraint(constraint: Constraint): boolean {
    if (constraint.className !== 'ConceptConstraint') {
      return false;
    }
    let conceptConstraint = <ConceptConstraint>constraint;
    return conceptConstraint.concept.type === ConceptType.CATEGORICAL;
  }

}
