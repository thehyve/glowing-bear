import {CombinationConstraint} from '../../models/constraints/combination-constraint';
import {Constraint} from '../../models/constraints/constraint';

export class ConstraintServiceMock {

  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;
  concepts = [];
  validPedigreeTypes = [];
  private _maxNumSearchResults = 100;

  constructor() {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
  }

  public depthOfConstraint(constraint: Constraint): number {
    return 1;
  }

  get maxNumSearchResults(): number {
    return this._maxNumSearchResults;
  }

  set maxNumSearchResults(value: number) {
    this._maxNumSearchResults = value;
  }
}
