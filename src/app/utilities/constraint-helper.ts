import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {ConceptType} from '../models/constraint-models/concept-type';
import {Constraint} from '../models/constraint-models/constraint';
import {StudyConstraint} from '../models/constraint-models/study-constraint';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {CombinationState} from '../models/constraint-models/combination-state';
import {NegationConstraint} from '../models/constraint-models/negation-constraint';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {ConstraintMark} from '../models/constraint-models/constraint-mark';

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

  /**
   * Make permutations of constraints from lists of constraints.
   * Example: for input lists [[a, b], [x, y, z]] this will generate
   * a sequence [[a, x], [a, y], [a, z], [b, x], [b, y], [b, z]].
   *
   * @param {Constraint[][]} constraints the lists to draw constraints from.
   * @return {Constraint[][]} a list of lists with the length of the input list,
   * enumerating all combinations with an elements from the first list, one from the second list, etc.
   */
  public static permuteConstraints(constraints: Constraint[][]): Constraint[][] {
    if (constraints.length < 1) {
      return [[]];
    }
    let head: Constraint[] = constraints.shift();
    let tailPermutations = this.permuteConstraints(constraints);
    let result: Constraint[][] = [];
    head.forEach((constraint: Constraint) => {
      tailPermutations.forEach((permutation: Constraint[]) => {
        result.push([constraint].concat(permutation));
      });
    });
    return result;
  }

  /**
   * Combine subject-level constraints into a subject-level combination constraint.
   * If the input is a singleton list, the contained element is returned, for
   * an empty list, a True constraint is returned.
   *
   * @param {Constraint[]} constraints the input subject-level constraints.
   * @return {Constraint} True, if the list is empty, the contained element if it is singleton,
   * or a subject-level combination constraint otherwise.
   */
  public static combineSubjectLevelConstraints(constraints: Constraint[]): Constraint {
    if (constraints.length < 1) {
      // empty list of patient level constraints
      return new TrueConstraint();
    } else if (constraints.length === 1) {
      // singleton constraint
      return constraints[0];
    } else {
      // wrap patient level constraints in a patient-level combination
      let combination = new CombinationConstraint();
      combination.combinationState = CombinationState.And;
      combination.mark = ConstraintMark.SUBJECT;
      constraints.forEach(child => combination.addChild(child));
      return combination;
    }
  }

  /**
   * Return a simple string representation of a string.
   * Note that not all constraint types are supported.
   */
  public static renderConstraint(constraint: Constraint): string {
    switch (constraint.className) {
      case 'TrueConstraint':
        return '';
      case 'StudyConstraint':
        return constraint.textRepresentation;
      case 'ConceptConstraint':
        return constraint.textRepresentation;
      case 'ValueConstraint':
        return constraint.textRepresentation;
      case 'CombinationConstraint':
        let combination = <CombinationConstraint>constraint;
        switch (combination.combinationState) {
          case CombinationState.And:
            return combination.children.map(child => this.renderConstraint(child)).join(', ');
          case CombinationState.Or:
            return combination.children.map(child => this.renderConstraint(child)).join(' or ');
          default:
            throw new Error(`Unsupported state: ${combination.combinationState}`);
        }
      case 'NegationConstraint':
        let negation = <NegationConstraint>constraint;
        return `not ${this.renderConstraint(negation.constraint)}`;
      default:
        throw new Error(`Unsupported constraint type: ${constraint.className}`);
    }
  }

  /**
   * Checks if the constraint is a conjunctive combination constraint with one categorical concept constraint
   * as child.
   *
   * @param {Constraint} constraint
   * @return {boolean} true iff the constraint is a conjunctive combination constraint with one categorical concept constraint
   * as child.
   */
  static isConjunctiveAndHasOneCategoricalConstraint(constraint: Constraint): boolean {
    if (constraint.className === 'CombinationConstraint') {
      let combiConstraint = <CombinationConstraint>constraint;
      if (combiConstraint.isAnd()) {
        let categoricalConceptConstraints = combiConstraint.children.filter((child: Constraint) =>
          ConstraintHelper.isCategoricalConceptConstraint(child)
        );
        return categoricalConceptConstraints.length === 1;
      }
    }
    return false;
  }


}
