import {Constraint} from '../../models/constraint-models/constraint';
import {ConstraintHelper} from './constraint-helper';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';

describe('ConstraintHelper', () => {

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
