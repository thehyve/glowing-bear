import {TransmartConstraintRewriter} from './transmart-constraint-rewriter';
import {
  TransmartAndConstraint,
  TransmartConceptConstraint, TransmartConstraint, TransmartNegationConstraint,
  TransmartOrConstraint,
  TransmartStudyNameConstraint,
  TransmartTrueConstraint
} from '../../models/transmart-models/transmart-constraint';

describe('TransmartConstraintRewriter', () => {

  const rewriter = new TransmartConstraintRewriter();

  function toObject(constraint: TransmartConstraint) {
    return JSON.parse(JSON.stringify(constraint));
  }

  function testConstraint(constraint: TransmartConstraint, expected: TransmartConstraint) {
    expect(toObject(rewriter.visit(constraint))).toEqual(toObject(expected));
  }

  it('should rewrite nested combination constraints', () => {
    const subconstraint = new TransmartAndConstraint();
    subconstraint.args = [new TransmartStudyNameConstraint()];
    const constraint = new TransmartAndConstraint();
    constraint.args = [subconstraint];
    const expected = new TransmartStudyNameConstraint();
    testConstraint(constraint, expected);
  });

  it('should rewrite disjunctive constraints with true leaves', () => {
    const constraint = new TransmartOrConstraint();
    constraint.args = [
      new TransmartConceptConstraint(),
      new TransmartTrueConstraint()
    ];
    const expected = new TransmartTrueConstraint();
    testConstraint(constraint, expected);
  });

  it('should rewrite empty disjunctive constraints', () => {
    const constraint = new TransmartOrConstraint();
    constraint.args = [];
    const expected = new TransmartNegationConstraint(new TransmartTrueConstraint());
    testConstraint(constraint, expected);
  });

  it('should rewrite conjunctive constraints with true leaves', () => {
    const constraint = new TransmartAndConstraint();
    constraint.args = [
      new TransmartConceptConstraint(),
      new TransmartTrueConstraint()
    ];
    const expected = new TransmartConceptConstraint();
    testConstraint(constraint, expected);
  });

  it('should rewrite empty conjunctive constraints', () => {
    const constraint = new TransmartAndConstraint();
    constraint.args = [];
    const expected = new TransmartTrueConstraint();
    testConstraint(constraint, expected);
  });

});
