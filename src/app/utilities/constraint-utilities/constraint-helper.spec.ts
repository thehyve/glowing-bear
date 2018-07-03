/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from '../../models/constraint-models/constraint';
import {ConstraintHelper} from './constraint-helper';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';

describe('ConstraintHelper.permuteConstraints', () => {

  it('should compute the permutation of a list of constraints', () => {
    let c1 = new ConceptConstraint();
    let c2 = new CombinationConstraint();
    let c3 = new TrueConstraint();
    let c4 = new ValueConstraint();
    let constraints: Constraint[][] = [
      [c1, c2],
      [c3, c4]
    ];

    let expected: Constraint[][] = [
      [c1, c3],
      [c1, c4],
      [c2, c3],
      [c2, c4]
    ];
    expect(ConstraintHelper.permuteConstraints(constraints)).toEqual(expected);
  });

  it('should compute the permutation of an empty list of constraints', () => {
    let constraints: Constraint[][] = [];

    let expected: Constraint[][] = [[]];
    expect(ConstraintHelper.permuteConstraints(constraints)).toEqual(expected);
  });

});

describe('ConstraintHelper.hasNonEmptyChildren', () => {

  it('should recognise combination with non-empty children', () => {
    let nonEmptyChild = new CombinationConstraint();
    nonEmptyChild.addChild(new TrueConstraint());
    let emptyChild = new CombinationConstraint();

    // combination with non-empty and empty child
    let combination = new CombinationConstraint();
    combination.addChild(nonEmptyChild);
    combination.addChild(emptyChild);
    expect(ConstraintHelper.hasNonEmptyChildren(combination)).toEqual(true);

    // combination with empty and non-empty child
    combination = new CombinationConstraint();
    combination.addChild(emptyChild);
    combination.addChild(nonEmptyChild);
    expect(ConstraintHelper.hasNonEmptyChildren(combination)).toEqual(true);

    // non-empty combination
    combination = new CombinationConstraint();
    combination.addChild(new TrueConstraint());
    expect(ConstraintHelper.hasNonEmptyChildren(combination)).toEqual(true);
  });

  it('should recognise combination without non-empty children', () => {
    let emptyChild1 = new CombinationConstraint();
    let emptyChild2 = new CombinationConstraint();

    // Empty combination
    let combination = new CombinationConstraint();
    expect(ConstraintHelper.hasNonEmptyChildren(combination)).toEqual(false);

    // Combination with empty children
    combination.addChild(emptyChild1);
    combination.addChild(emptyChild2);
    expect(ConstraintHelper.hasNonEmptyChildren(combination)).toEqual(false);
  });

});
