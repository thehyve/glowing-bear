import {Constraint} from './constraint';
import {CombinationState} from "./combination-state";

export class CombinationConstraint implements Constraint {

  private _type: string;
  private _children: Constraint[];
  private _isNot: boolean;
  private _combinationState: CombinationState;


  constructor() {
    this._type = 'CombinationConstraint';
    this._children = [];
    this._isNot = false;
    this.combinationState = CombinationState.And;
  }

  getConstraintType(): string {
    return this._type;
  }

  toQueryObject(): Object {
    // Convert all children to query objects
    let childQueryObjects =
      this._children.map((constraint: Constraint) => constraint.toQueryObject());

    // Ignore all null and {} values
    // TODO: show validation error instead?
    childQueryObjects = childQueryObjects.filter(object => {
      if (!object) {
        return false;
      }
      return Object.keys(object).length > 0;
    });

    // Combination
    let combinationQueryObject = {
      type: this._combinationState === CombinationState.And ? "and" : "or",
      args: childQueryObjects
    };

    // If we're negating, we wrap the object in a negation constraint
    if (this._isNot) {
      return {
        type: "negation",
        arg: combinationQueryObject
      }
    }
    return combinationQueryObject;
  }

  get textRepresentation(): string {
    return 'Group';
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

  set children(value:Constraint[]) {
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

  removeChildConstraint(child:Constraint) {
    let index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

}
