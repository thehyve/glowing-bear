import {CombinationConstraint} from '../../models/constraints/combination-constraint';
import {Constraint} from '../../models/constraints/constraint';

export class ConstraintServiceMock {

  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;
  concepts = [];
  validPedigreeTypes = [];

  constructor() {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
  }

  public depthOfConstraint(constraint: Constraint): number {
    return 1;
  }
}
