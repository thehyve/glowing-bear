import {Constraint} from './constraint';
import {CombinationState} from "./combination-state";

export class CombinationConstraint implements Constraint {

  private _children: Constraint[];
  private _isNot: boolean;
  private _combinationState: CombinationState;


  constructor() {
    this._children = [];
    this._isNot = false;
    this.combinationState = CombinationState.And;
  }

  getConstraintType(): string {
    return CombinationConstraint.name;
  }

  toJsonString(): string {
    return '';
  }

  isAnd() {
    return this.combinationState === CombinationState.And;
  }

  get isNot(): boolean {
    return this._isNot;
  }

  set isNot(value: boolean) {
    this._isNot = value;
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
    this.combinationState =
      (this.combinationState === CombinationState.And) ? CombinationState.Or : CombinationState.And;
  }

}
