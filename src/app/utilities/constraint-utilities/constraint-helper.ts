/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {ValueType} from '../../models/constraint-models/value-type';
import {Constraint} from '../../models/constraint-models/constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';

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
    return conceptConstraint.concept.type === ValueType.CATEGORICAL;
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
   * or this property holds recursively for any of its children.
   */
  static hasNonEmptyChildren(combination: CombinationConstraint): boolean {
    return combination.children.some((child: Constraint) => {
      if (child.className === 'CombinationConstraint') {
        return this.hasNonEmptyChildren(<CombinationConstraint>child);
      }
      // all other types of constraints count as non-empty children.
      return true;
    });
  }
}
