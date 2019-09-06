/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {ConceptType} from '../../models/constraint-models/concept-type';
import {Constraint} from '../../models/constraint-models/constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';

export class ConstraintHelper {

  /**
   * Tests if the constraint is a concept constraint for a categorical concept.
   *
   * @param {Constraint} constraint
   * @return {boolean} true if the constraint is a categorical concept constraint; false otherwise.
   */
  static isCategoricalConceptConstraint(constraint: Constraint): boolean {
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
  static permuteConstraints(constraints: Constraint[][]): Constraint[][] {
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
  static combineSubjectLevelConstraints(constraints: Constraint[]): Constraint {
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
      constraints.forEach(child => combination.addChild(child));
      return combination;
    }
  }

  /**
   * Ensures that the resulting constraint selects all patients related to the observations
   * selected by observationConstraint.
   * E.g., when the observationConstraint selects samples, the constraint is wrapped
   * in a patient-level combination constraint.
   *
   * @param {Constraint} observationConstraint
   * @return {Constraint}
   */
  static ensurePatientLevelConstraint(observationConstraint: Constraint): Constraint {
    if (observationConstraint.className === 'CombinationConstraint' &&
      (<CombinationConstraint>observationConstraint).dimension !== 'patient'
      || observationConstraint.className !== 'CombinationConstraint') {
      return new CombinationConstraint([observationConstraint], CombinationState.And, 'patient');
    }
    return observationConstraint;
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

  /**
   * Checks if the combination has any children other than combinations
   * without non-empty children.
   *
   * @param {CombinationConstraint} combination
   * @return {boolean} true iff the combination has any children other than combinations
   * for the same dimension or this property holds recursively for any of its children.
   */
  static hasNonEmptyChildren(combination: CombinationConstraint): boolean {
    return combination.children.some((child: Constraint) => {
      if (child.className === 'CombinationConstraint' &&
        (<CombinationConstraint>child).dimension === combination.dimension &&
        child.negated === false) {
        return this.hasNonEmptyChildren(<CombinationConstraint>child);
      }
      // all other types of constraints count as non-empty children.
      return true;
    });
  }

  /**
   * Return a brief string representation of a constraint.
   * Note that not all constraint types are supported.
   */
  static brief(constraint: Constraint): string {
    // For a combination with one concept constraint, return the concept name
    if (constraint.className === 'CombinationConstraint') {
      let combiConstraint = <CombinationConstraint>constraint;
      if (combiConstraint.isAnd()) {
        let categoricalConceptConstraints = combiConstraint.children.filter((child: Constraint) =>
          ConstraintHelper.isCategoricalConceptConstraint(child)
        );
        if (categoricalConceptConstraints.length === 1) {
          return (<ConceptConstraint>categoricalConceptConstraints[0]).concept.name;
        }
      }
    } else if (ConstraintHelper.isCategoricalConceptConstraint(constraint)) {
      return (<ConceptConstraint>constraint).concept.name;
    }
    // Else, create a brief representation of the constraint
    return constraint.textRepresentation;
  }

}
