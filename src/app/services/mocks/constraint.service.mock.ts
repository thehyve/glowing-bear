import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {Constraint} from '../../models/constraint-models/constraint';
import {TreeNode} from 'primeng/api';
import {DropMode} from '../../models/drop-mode';
import {Concept} from '../../models/constraint-models/concept';

export class ConstraintServiceMock {

  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;
  _constraint: Constraint = new CombinationConstraint();
  validPedigreeTypes = [];
  concepts: Concept[] = [];
  conceptConstraints: Constraint[] = [];
  conceptLabels: string[] = [];
  allConstraints: Constraint[] = [];

  constructor() {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
  }

  init() {
  }

  public depthOfConstraint(constraint: Constraint): number {
    return 1;
  }

  public constraint_1(): Constraint {
    return this._constraint;
  }

  public constraint_2(): Constraint {
    return this._constraint;
  }

  public generateInclusionConstraint(): Constraint {
    return this._constraint;
  }

  public hasExclusionConstraint(): Boolean {
    return false;
  }

  public constraint_1_2(): Constraint {
    return this._constraint;
  }

  public generateConstraintFromTreeNode(selectedNode: TreeNode, dropMode: DropMode): Constraint {
    return this._constraint;
  }

}
