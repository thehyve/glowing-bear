import {Constraint} from './constraint';
import {CombinationState} from './combination-state';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';

export class CombinationConstraint extends Constraint {

  private _children: Constraint[];
  private _combinationState: CombinationState;
  private _isRoot: boolean;

  constructor() {
    super();
    this._children = [];
    this.combinationState = CombinationState.And;
    this.isRoot = false;
    this.textRepresentation = 'Group';
  }

  get className(): string {
    return 'CombinationConstraint';
  }

  hasNonEmptyChildren(): boolean {
    return TransmartConstraintMapper.getNonEmptyChildObjects(this).length > 0;
  }

  addChild(constraint: Constraint) {
    if (!(constraint.className === 'CombinationConstraint'
        && (<CombinationConstraint>constraint).isRoot)) {
      constraint.parent = this;
    }
    this.children.push(constraint);
  }

  isAnd() {
    return this.combinationState === CombinationState.And;
  }

  get children(): Constraint[] {
    return this._children;
  }

  set children(value: Constraint[]) {
    this._children = value;
  }

  get combinationState(): CombinationState {
    return this._combinationState;
  }

  set combinationState(value: CombinationState) {
    this._combinationState = value;
  }

  switchCombinationState() {
    this.combinationState = (this.combinationState === CombinationState.And) ?
      CombinationState.Or : CombinationState.And;
  }

  removeChildConstraint(child: Constraint) {
    let index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  get isRoot(): boolean {
    return this._isRoot;
  }

  set isRoot(value: boolean) {
    this._isRoot = value;
  }

}
